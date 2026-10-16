#!/usr/bin/env python3
"""
Leela Laher Tech Point - Digital Catalogue
Pure-Python server (standard library only: http.server + sqlite3).

Run:   python server.py
Shop:  http://localhost:8080/
Admin: http://localhost:8080/admin
"""
import base64
import csv
import hashlib
import hmac
import io
import json
import os
import re
import secrets
import sqlite3
import threading
import time
import traceback
import uuid
from datetime import datetime, timedelta
from http import cookies
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse

APP_NAME = "Leela Laher Tech Point - Digital Catalogue"
VERSION = "1.6.0"
RELEASED = "2026-10-16"

BASE = os.path.dirname(os.path.abspath(__file__))
PUBLIC = os.path.join(BASE, "public")
DATA = os.path.join(BASE, "data")
UPLOADS = os.path.join(DATA, "uploads")
DB_PATH = os.path.join(DATA, "catalogue.db")

HOST = os.environ.get("HOST", "0.0.0.0")
PORT = int(os.environ.get("PORT", "8080"))
DEFAULT_ADMIN_USER = "admin"
# First-run admin password: taken from ADMIN_PASSWORD, otherwise generated randomly and saved to data/first-login.txt
FIRST_LOGIN_FILE = os.path.join(DATA, "first-login.txt")
SESSION_HOURS = 12
MAX_BODY = 12 * 1024 * 1024  # 12 MB (image uploads arrive base64-encoded)

DEFAULT_SETTINGS = {
    "store_name": "Leela Laher Tech Point",
    "tagline": "Your trusted electronics showroom",
    "whatsapp": "919999999999",
    "email": "your-email@example.com",
    "phone": "+91 99999 99999",
    "address": "Showroom address, City, State - PIN",
    "website": "",
    "hours": "Mon-Sat 10:00 AM - 8:30 PM",
    "price_note": "Prices are indicative and may change. Contact us for the best offer.",
    "show_prices": "1",
}

# Content of the "About us" page (stored as JSON in settings, editable in Admin > Settings)
DEFAULT_ABOUT = {
    "title": "Your trusted technology partner in Gadag",
    "intro": ("Leela Laher Tech Point is a proud part of the Leela Laher Group, Gadag. We bring genuine electronics together "
              "under one roof: CCTV security systems, Apple products, televisions, air conditioners and computer accessories. "
              "Every product comes with honest advice, fair prices and expert installation.\n\n"
              "Whether you are securing your home, upgrading your office or equipping a government project, our team stands "
              "with you before, during and long after your purchase."),
    "team": [
        {
            "name": "Mr. Avinash Jain",
            "role": "CEO & Founder",
            "tag": "Leela Laher Group, Gadag",
            "photo": "",
            "qualification": "B.Com, MBA",
            "experience": "20+ years in the electronics trade",
            "bio": ("Mr. Avinash Jain founded Leela Laher Tech Point with a simple promise: genuine products, fair prices and "
                    "service you can count on. A member of the respected Leela Laher Group of Gadag, he brings over two decades "
                    "of experience in the electronics trade, backed by a strong business foundation as a B.Com and MBA graduate.\n\n"
                    "Customers and partners value him for his deep product knowledge, honest guidance and relationships built on "
                    "trust. His vision is to make the latest technology easy to choose and easy to own for every home and "
                    "business in Gadag and beyond."),
            "points": ["20+ years of experience in the electronics trade", "B.Com and MBA graduate",
                       "Part of the Leela Laher Group, Gadag"],
        },
        {
            "name": "Mr. Shaukat",
            "role": "Head of Operations",
            "tag": "Technology & installation expert",
            "photo": "",
            "qualification": "Operations & installation leadership",
            "experience": "15+ years hands-on experience",
            "bio": ("Mr. Shaukat leads operations at Leela Laher Tech Point, making sure every order, delivery and installation "
                    "is done right the first time. With more than 15 years of hands-on experience in technology and installation "
                    "work, for private clients as well as government projects, he knows the practical side of technology inside out.\n\n"
                    "His problem-solving, eye for detail and commitment to deadlines give our customers complete peace of mind, "
                    "from the first site visit to the final handover."),
            "points": ["15+ years of hands-on technology and installation work", "Private and government projects",
                       "Delivery, installation and after-sales support"],
        },
    ],
}

MIME = {
    ".html": "text/html; charset=utf-8", ".js": "application/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png",
    ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif",
    ".ico": "image/x-icon", ".json": "application/json", ".txt": "text/plain; charset=utf-8",
}

# --------------------------------------------------------------------------- db

def now():
    return datetime.now().isoformat(timespec="seconds")


def connect():
    conn = sqlite3.connect(DB_PATH, timeout=15)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


SCHEMA = """
CREATE TABLE IF NOT EXISTS settings(key TEXT PRIMARY KEY, value TEXT);
CREATE TABLE IF NOT EXISTS admins(
  id INTEGER PRIMARY KEY, username TEXT UNIQUE NOT NULL, pw_hash TEXT NOT NULL,
  salt TEXT NOT NULL, created_at TEXT, pw_changed_at TEXT);
CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY, admin_id INTEGER, expires REAL);
CREATE TABLE IF NOT EXISTS categories(
  id INTEGER PRIMARY KEY, slug TEXT UNIQUE NOT NULL, name TEXT NOT NULL, icon TEXT,
  tagline TEXT, color1 TEXT, color2 TEXT, sort INTEGER DEFAULT 0);
CREATE TABLE IF NOT EXISTS subcategories(
  id INTEGER PRIMARY KEY, category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL, icon TEXT, sort INTEGER DEFAULT 0);
CREATE TABLE IF NOT EXISTS products(
  id INTEGER PRIMARY KEY, category_id INTEGER REFERENCES categories(id),
  subcategory_id INTEGER REFERENCES subcategories(id) ON DELETE SET NULL,
  name TEXT NOT NULL, brand TEXT, model TEXT, short TEXT, description TEXT,
  price INTEGER, mrp INTEGER, specs TEXT DEFAULT '[]', highlights TEXT DEFAULT '[]',
  images TEXT DEFAULT '[]', badge TEXT, in_stock INTEGER DEFAULT 1, active INTEGER DEFAULT 1,
  featured INTEGER DEFAULT 0, sort INTEGER DEFAULT 0, created_at TEXT, updated_at TEXT);
CREATE TABLE IF NOT EXISTS visitors(
  id INTEGER PRIMARY KEY, token TEXT UNIQUE NOT NULL, name TEXT, mobile TEXT UNIQUE, city TEXT,
  consent INTEGER DEFAULT 0, first_seen TEXT, last_seen TEXT, visits INTEGER DEFAULT 0, user_agent TEXT);
CREATE TABLE IF NOT EXISTS visits(id INTEGER PRIMARY KEY, visitor_id INTEGER, ts TEXT);
CREATE TABLE IF NOT EXISTS events(id INTEGER PRIMARY KEY, visitor_id INTEGER, product_id INTEGER, type TEXT, ts TEXT);
CREATE TABLE IF NOT EXISTS enquiries(
  id INTEGER PRIMARY KEY, visitor_id INTEGER, product_id INTEGER, channel TEXT, message TEXT,
  status TEXT DEFAULT 'new', note TEXT, ts TEXT);
CREATE INDEX IF NOT EXISTS ix_visits_ts ON visits(ts);
CREATE INDEX IF NOT EXISTS ix_events_ts ON events(ts);
CREATE INDEX IF NOT EXISTS ix_enq_ts ON enquiries(ts);
"""


def hash_pw(password, salt=None):
    salt = salt or secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), bytes.fromhex(salt), 200_000).hex()
    return digest, salt


def init_db():
    os.makedirs(UPLOADS, exist_ok=True)
    conn = connect()
    # WAL is fastest locally; hosts with network file systems (e.g. PythonAnywhere) should use DELETE
    journal = os.environ.get("SQLITE_JOURNAL", "WAL").upper()
    conn.execute("PRAGMA journal_mode=%s" % (journal if journal in ("WAL", "DELETE", "TRUNCATE") else "WAL"))
    conn.executescript(SCHEMA)
    for k, v in DEFAULT_SETTINGS.items():
        conn.execute("INSERT OR IGNORE INTO settings(key,value) VALUES(?,?)", (k, v))
    conn.execute("INSERT OR IGNORE INTO settings(key,value) VALUES('about',?)", (json.dumps(DEFAULT_ABOUT),))
    first_admin = False
    if not conn.execute("SELECT 1 FROM admins").fetchone():
        password = os.environ.get("ADMIN_PASSWORD") or secrets.token_urlsafe(9)
        h, s = hash_pw(password)
        conn.execute("INSERT INTO admins(username,pw_hash,salt,created_at) VALUES(?,?,?,?)",
                     (DEFAULT_ADMIN_USER, h, s, now()))
        with open(FIRST_LOGIN_FILE, "w", encoding="utf-8") as f:
            f.write("Leela Laher Tech Point - first admin login\n\n"
                    "Username: %s\nPassword: %s\n\n"
                    "Log in at /admin, change this password in Settings, then delete this file.\n"
                    % (DEFAULT_ADMIN_USER, password))
        first_admin = password
    migrate(conn)
    if not conn.execute("SELECT 1 FROM categories").fetchone():
        from seed_data import CATEGORIES
        seed(conn, CATEGORIES)
    conn.commit()
    conn.close()
    return first_admin


DEFAULT_SHOWCASE = {
    "cctv-cameras": "/brand/showcase/cctv.webp",
    "apple-products": "/brand/showcase/phone.webp",
    "televisions": "/brand/showcase/tv.webp",
    "air-conditioners": "/brand/showcase/ac.webp",
    "computer-accessories": "/brand/showcase/headphones.webp",
}


def migrate(conn):
    """Add columns introduced after v1.0 to existing databases."""
    cat_cols = {r[1] for r in conn.execute("PRAGMA table_info(categories)")}
    if "showcase" not in cat_cols:
        conn.execute("ALTER TABLE categories ADD COLUMN showcase TEXT")
        for slug, url in DEFAULT_SHOWCASE.items():
            conn.execute("UPDATE categories SET showcase=? WHERE slug=?", (url, slug))
    prod_cols = {r[1] for r in conn.execute("PRAGMA table_info(products)")}
    if "representative" not in prod_cols:
        conn.execute("ALTER TABLE products ADD COLUMN representative INTEGER DEFAULT 0")
    admin_cols = {r[1] for r in conn.execute("PRAGMA table_info(admins)")}
    if "role" not in admin_cols:
        conn.execute("ALTER TABLE admins ADD COLUMN role TEXT DEFAULT 'staff'")
    if "last_login" not in admin_cols:
        conn.execute("ALTER TABLE admins ADD COLUMN last_login TEXT")
    # there must always be one master (the owner): the oldest login becomes master if none exists
    if conn.execute("SELECT 1 FROM admins").fetchone() and not conn.execute("SELECT 1 FROM admins WHERE role='master'").fetchone():
        conn.execute("UPDATE admins SET role='master' WHERE id=(SELECT MIN(id) FROM admins)")


def seed(conn, categories):
    for ci, cat in enumerate(categories):
        cur = conn.execute(
            "INSERT INTO categories(slug,name,icon,tagline,color1,color2,sort,showcase) VALUES(?,?,?,?,?,?,?,?)",
            (cat["slug"], cat["name"], cat["icon"], cat["tagline"], cat["colors"][0], cat["colors"][1], ci,
             DEFAULT_SHOWCASE.get(cat["slug"])))
        cat_id = cur.lastrowid
        for si, sub in enumerate(cat["subcategories"]):
            sid = conn.execute("INSERT INTO subcategories(category_id,name,icon,sort) VALUES(?,?,?,?)",
                               (cat_id, sub["name"], sub["icon"], si)).lastrowid
            for p in sub.get("products", []):
                conn.execute(
                    """INSERT INTO products(category_id,subcategory_id,name,brand,model,short,description,
                       price,mrp,specs,highlights,images,badge,in_stock,active,featured,created_at,updated_at)
                       VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                    (cat_id, sid, p["name"], p.get("brand", ""), p.get("model", ""), p.get("short", ""),
                     p.get("description", ""), p.get("price"), p.get("mrp"),
                     json.dumps(p.get("specs", [])), json.dumps(p.get("highlights", [])), "[]",
                     p.get("badge", ""), 1, 1, 1 if p.get("featured") else 0, now(), now()))


def rows(cursor):
    return [dict(r) for r in cursor.fetchall()]


def get_settings(conn):
    return {r["key"]: r["value"] for r in conn.execute("SELECT key,value FROM settings")}


def product_out(r):
    d = dict(r)
    for k in ("specs", "highlights", "images"):
        try:
            d[k] = json.loads(d.get(k) or "[]")
        except ValueError:
            d[k] = []
    d["in_stock"] = bool(d.get("in_stock"))
    d["active"] = bool(d.get("active"))
    d["featured"] = bool(d.get("featured"))
    d["representative"] = bool(d.get("representative"))
    return d


def image_url(value):
    """Accept only images we host: uploads or the bundled showcase renders."""
    v = str(value or "")
    return v if re.fullmatch(r"/(uploads|brand/showcase)/[\w.-]+", v) else None

# --------------------------------------------------------------- helpers


class ApiError(Exception):
    def __init__(self, msg, code=400):
        super().__init__(msg)
        self.msg, self.code = msg, code


def clean(value, maxlen=200):
    s = re.sub(r"[\x00-\x1f\x7f]", " ", str(value if value is not None else "")).strip()
    return s[:maxlen]


def clean_text(value, maxlen=4000):
    s = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", str(value if value is not None else "")).strip()
    return s[:maxlen]


def to_int(value, default=None):
    if value in (None, ""):
        return default
    try:
        return int(float(str(value).replace(",", "")))
    except ValueError:
        raise ApiError("Invalid number: %s" % value)


def normalise_mobile(raw):
    m = re.sub(r"\D", "", str(raw or ""))
    if len(m) == 12 and m.startswith("91"):
        m = m[2:]
    if len(m) == 11 and m.startswith("0"):
        m = m[1:]
    return m


def slugify(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-") or uuid.uuid4().hex[:6]


def csv_safe(v):
    s = "" if v is None else str(v)
    return "'" + s if s[:1] in ("=", "+", "-", "@") else s


class RateLimiter:
    def __init__(self, limit, window):
        self.limit, self.window, self.hits, self.lock = limit, window, {}, threading.Lock()

    def allow(self, key):
        t = time.time()
        with self.lock:
            q = [x for x in self.hits.get(key, []) if t - x < self.window]
            if len(q) >= self.limit:
                self.hits[key] = q
                return False
            q.append(t)
            self.hits[key] = q
            return True


public_limiter = RateLimiter(90, 60)       # 90 tracking calls / minute / IP
login_limiter = RateLimiter(8, 300)        # 8 login attempts / 5 minutes / IP

# --------------------------------------------------------------- routing

ROUTES = []


def route(method, pattern, auth=False):
    def deco(fn):
        ROUTES.append((method, re.compile("^" + pattern + "$"), auth, fn))
        return fn
    return deco

# ---------- public API


@route("GET", "/api/version")
def api_version(req, conn, body):
    return {"app": APP_NAME, "version": VERSION, "released": RELEASED}


@route("GET", "/api/catalog")
def api_catalog(req, conn, body):
    s = get_settings(conn)
    public = {k: s.get(k, "") for k in DEFAULT_SETTINGS}
    cats = rows(conn.execute("SELECT * FROM categories ORDER BY sort, id"))
    subs = rows(conn.execute("SELECT * FROM subcategories ORDER BY sort, id"))
    prods = [product_out(r) for r in conn.execute(
        "SELECT * FROM products WHERE active=1 ORDER BY featured DESC, sort, id")]
    if public.get("show_prices") != "1":
        for p in prods:
            p["price"] = p["mrp"] = None
    return {"version": VERSION, "settings": public, "categories": cats,
            "subcategories": subs, "products": prods, "about": get_about(s)}


def get_about(settings):
    try:
        about = json.loads(settings.get("about") or "")
        return about if isinstance(about, dict) else DEFAULT_ABOUT
    except ValueError:
        return DEFAULT_ABOUT


@route("GET", "/api/admin/about", auth=True)
def api_about(req, conn, body):
    return {"about": get_about(get_settings(conn))}


@route("PUT", "/api/admin/about", auth=True)
def api_about_save(req, conn, body):
    team = []
    for m in (body.get("team") or [])[:6]:
        if not isinstance(m, dict) or not clean(m.get("name"), 80):
            continue
        photo = str(m.get("photo") or "")
        team.append({
            "name": clean(m.get("name"), 80), "role": clean(m.get("role"), 80), "tag": clean(m.get("tag"), 100),
            "photo": photo if re.fullmatch(r"/uploads/[\w.-]+", photo) else "",
            "qualification": clean(m.get("qualification"), 120), "experience": clean(m.get("experience"), 120),
            "bio": clean_text(m.get("bio"), 2500),
            "points": [clean(p, 160) for p in (m.get("points") or []) if clean(p, 160)][:8],
        })
    about = {"title": clean(body.get("title"), 140), "intro": clean_text(body.get("intro"), 3000), "team": team}
    conn.execute("INSERT OR REPLACE INTO settings(key,value) VALUES('about',?)", (json.dumps(about),))
    conn.commit()
    return {"ok": True}


def find_visitor(conn, token):
    if not token:
        return None
    return conn.execute("SELECT * FROM visitors WHERE token=?", (str(token)[:64],)).fetchone()


@route("POST", "/api/visit")
def api_visit(req, conn, body):
    req.rate_check()
    v = find_visitor(conn, body.get("token"))
    ua = clean(req.headers.get("User-Agent", ""), 250)
    if not v:
        if not body.get("mobile"):
            return {"need_kyc": True}
        name = clean(body.get("name"), 60)
        mobile = normalise_mobile(body.get("mobile"))
        city = clean(body.get("city"), 60)
        if len(name) < 2:
            raise ApiError("Please enter your full name.")
        if not re.fullmatch(r"[6-9]\d{9}", mobile):
            raise ApiError("Please enter a valid 10-digit mobile number.")
        if len(city) < 2:
            raise ApiError("Please enter your city.")
        if not body.get("consent"):
            raise ApiError("Please accept the consent to continue.")
        v = conn.execute("SELECT * FROM visitors WHERE mobile=?", (mobile,)).fetchone()
        if v:
            conn.execute("UPDATE visitors SET name=?, city=?, consent=1 WHERE id=?", (name, city, v["id"]))
        else:
            conn.execute("""INSERT INTO visitors(token,name,mobile,city,consent,first_seen,last_seen,visits,user_agent)
                            VALUES(?,?,?,?,1,?,?,0,?)""", (secrets.token_urlsafe(24), name, mobile, city, now(), now(), ua))
        v = conn.execute("SELECT * FROM visitors WHERE mobile=?", (mobile,)).fetchone()
    conn.execute("UPDATE visitors SET visits=visits+1, last_seen=?, user_agent=? WHERE id=?", (now(), ua, v["id"]))
    conn.execute("INSERT INTO visits(visitor_id,ts) VALUES(?,?)", (v["id"], now()))
    conn.commit()
    return {"token": v["token"], "name": v["name"], "city": v["city"], "mobile": v["mobile"]}


@route("POST", "/api/track")
def api_track(req, conn, body):
    req.rate_check()
    etype = body.get("type")
    if etype not in ("view", "share", "call"):
        raise ApiError("Unknown event")
    pid = to_int(body.get("product_id"))
    if pid and not conn.execute("SELECT 1 FROM products WHERE id=?", (pid,)).fetchone():
        raise ApiError("Unknown product", 404)
    v = find_visitor(conn, body.get("token"))
    conn.execute("INSERT INTO events(visitor_id,product_id,type,ts) VALUES(?,?,?,?)",
                 (v["id"] if v else None, pid, etype, now()))
    conn.commit()
    return {"ok": True}


@route("POST", "/api/enquiry")
def api_enquiry(req, conn, body):
    req.rate_check()
    channel = body.get("channel")
    if channel not in ("whatsapp", "email", "call"):
        raise ApiError("Unknown channel")
    pid = to_int(body.get("product_id"))
    if pid and not conn.execute("SELECT 1 FROM products WHERE id=?", (pid,)).fetchone():
        raise ApiError("Unknown product", 404)
    v = find_visitor(conn, body.get("token"))
    conn.execute("INSERT INTO enquiries(visitor_id,product_id,channel,message,status,ts) VALUES(?,?,?,?,?,?)",
                 (v["id"] if v else None, pid, channel, clean_text(body.get("message"), 1500), "new", now()))
    conn.commit()
    return {"ok": True}

# ---------- admin: auth


@route("POST", "/api/admin/login")
def api_login(req, conn, body):
    if not login_limiter.allow(req.client_ip()):
        raise ApiError("Too many attempts. Please wait 5 minutes and try again.", 429)
    user = clean(body.get("username"), 60)
    pw = str(body.get("password") or "")
    a = conn.execute("SELECT * FROM admins WHERE username=?", (user,)).fetchone()
    if not a or not hmac.compare_digest(hash_pw(pw, a["salt"])[0], a["pw_hash"]):
        time.sleep(0.6)
        raise ApiError("Incorrect username or password.", 401)
    token = secrets.token_urlsafe(32)
    conn.execute("DELETE FROM sessions WHERE expires < ?", (time.time(),))
    conn.execute("INSERT INTO sessions(token,admin_id,expires) VALUES(?,?,?)",
                 (token, a["id"], time.time() + SESSION_HOURS * 3600))
    conn.execute("UPDATE admins SET last_login=? WHERE id=?", (now(), a["id"]))
    conn.commit()
    req.set_cookie = "llsess=%s; HttpOnly; SameSite=Strict; Path=/; Max-Age=%d%s" % (token, SESSION_HOURS * 3600, req.secure_flag())
    return {"ok": True, "username": a["username"]}


@route("POST", "/api/admin/logout", auth=True)
def api_logout(req, conn, body):
    conn.execute("DELETE FROM sessions WHERE token=?", (req.session_token,))
    conn.commit()
    req.set_cookie = "llsess=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0" + req.secure_flag()
    return {"ok": True}


@route("GET", "/api/admin/me", auth=True)
def api_me(req, conn, body):
    a = req.admin
    s = get_settings(conn)
    warnings = []
    if a["pw_changed_at"] is None:
        warnings.append("You are using the default password. Please change it in Settings.")
    if s.get("whatsapp") == DEFAULT_SETTINGS["whatsapp"] or s.get("email") == DEFAULT_SETTINGS["email"]:
        warnings.append("Set your real WhatsApp number and email in Settings so enquiries reach you.")
    return {"username": a["username"], "role": a["role"] or "staff", "version": VERSION, "released": RELEASED,
            "app": APP_NAME, "warnings": warnings}


@route("POST", "/api/admin/password", auth=True)
def api_password(req, conn, body):
    a = req.admin
    if not hmac.compare_digest(hash_pw(str(body.get("current") or ""), a["salt"])[0], a["pw_hash"]):
        raise ApiError("Current password is incorrect.")
    new = check_password(body.get("new"))
    new_user = check_username(conn, body.get("username") or a["username"], a["id"])
    h, s = hash_pw(new)
    conn.execute("UPDATE admins SET username=?, pw_hash=?, salt=?, pw_changed_at=? WHERE id=?",
                 (new_user, h, s, now(), a["id"]))
    conn.execute("DELETE FROM sessions WHERE admin_id=? AND token<>?", (a["id"], req.session_token))
    conn.commit()
    return {"ok": True}


def check_password(value):
    pw = str(value or "")
    if len(pw) < 8 or not re.search(r"\d", pw) or not re.search(r"[A-Za-z]", pw):
        raise ApiError("Password must be at least 8 characters with letters and numbers.")
    return pw


def check_username(conn, value, own_id=None):
    name = clean(value, 40)
    if not re.fullmatch(r"[A-Za-z0-9_.@-]{3,40}", name):
        raise ApiError("Username may use letters, numbers and . _ @ - (3-40 characters).")
    taken = conn.execute("SELECT id FROM admins WHERE username=? COLLATE NOCASE", (name,)).fetchone()
    if taken and taken["id"] != own_id:
        raise ApiError("That username is already in use.")
    return name


# ---------- admin: team logins (master only)

def require_master(req):
    if (req.admin["role"] or "staff") != "master":
        raise ApiError("Only the master admin can manage logins.", 403)


@route("GET", "/api/admin/users", auth=True)
def api_users(req, conn, body):
    require_master(req)
    users = rows(conn.execute("SELECT id, username, role, created_at, pw_changed_at, last_login FROM admins ORDER BY role='master' DESC, id"))
    return {"users": users, "me": req.admin["id"]}


@route("POST", "/api/admin/users", auth=True)
def api_user_create(req, conn, body):
    require_master(req)
    name = check_username(conn, body.get("username"))
    pw = check_password(body.get("password"))
    role = "master" if body.get("role") == "master" else "staff"
    h, s = hash_pw(pw)
    uid = conn.execute("INSERT INTO admins(username,pw_hash,salt,created_at,pw_changed_at,role) VALUES(?,?,?,?,?,?)",
                       (name, h, s, now(), now(), role)).lastrowid
    conn.commit()
    return {"ok": True, "id": uid}


@route("PUT", r"/api/admin/users/(\d+)", auth=True)
def api_user_update(req, conn, body, uid):
    require_master(req)
    uid = int(uid)
    u = conn.execute("SELECT * FROM admins WHERE id=?", (uid,)).fetchone()
    if not u:
        raise ApiError("Login not found.", 404)
    role = "master" if body.get("role") == "master" else "staff"
    if u["role"] == "master" and role != "master" and \
            conn.execute("SELECT COUNT(*) FROM admins WHERE role='master'").fetchone()[0] <= 1:
        raise ApiError("There must always be at least one master admin.")
    name = check_username(conn, body.get("username") or u["username"], uid)
    conn.execute("UPDATE admins SET username=?, role=? WHERE id=?", (name, role, uid))
    if body.get("password"):
        h, s = hash_pw(check_password(body.get("password")))
        conn.execute("UPDATE admins SET pw_hash=?, salt=?, pw_changed_at=? WHERE id=?", (h, s, now(), uid))
        if uid != req.admin["id"]:
            conn.execute("DELETE FROM sessions WHERE admin_id=?", (uid,))
    conn.commit()
    return {"ok": True}


@route("DELETE", r"/api/admin/users/(\d+)", auth=True)
def api_user_delete(req, conn, body, uid):
    require_master(req)
    uid = int(uid)
    if uid == req.admin["id"]:
        raise ApiError("You can't remove your own login.")
    u = conn.execute("SELECT role FROM admins WHERE id=?", (uid,)).fetchone()
    if not u:
        raise ApiError("Login not found.", 404)
    if u["role"] == "master" and conn.execute("SELECT COUNT(*) FROM admins WHERE role='master'").fetchone()[0] <= 1:
        raise ApiError("There must always be at least one master admin.")
    conn.execute("DELETE FROM sessions WHERE admin_id=?", (uid,))
    conn.execute("DELETE FROM admins WHERE id=?", (uid,))
    conn.commit()
    return {"ok": True}

# ---------- admin: dashboard


def cutoff_for(days):
    if days <= 0:
        return "0000"
    return (datetime.now() - timedelta(days=days - 1)).strftime("%Y-%m-%d")


@route("GET", "/api/admin/stats", auth=True)
def api_stats(req, conn, body):
    days = to_int(req.q("days", "30"), 30)
    co = cutoff_for(days)
    one = lambda sql, *a: conn.execute(sql, a).fetchone()[0]

    kpi = {
        "visits": one("SELECT COUNT(*) FROM visits WHERE ts>=?", co),
        "unique_visitors": one("SELECT COUNT(DISTINCT visitor_id) FROM visits WHERE ts>=?", co),
        "new_customers": one("SELECT COUNT(*) FROM visitors WHERE first_seen>=?", co),
        "total_customers": one("SELECT COUNT(*) FROM visitors"),
        "product_views": one("SELECT COUNT(*) FROM events WHERE type='view' AND ts>=?", co),
        "enquiries": one("SELECT COUNT(*) FROM enquiries WHERE ts>=?", co),
        "enq_whatsapp": one("SELECT COUNT(*) FROM enquiries WHERE channel='whatsapp' AND ts>=?", co),
        "enq_email": one("SELECT COUNT(*) FROM enquiries WHERE channel='email' AND ts>=?", co),
        "enq_call": one("SELECT COUNT(*) FROM enquiries WHERE channel='call' AND ts>=?", co),
        "enq_visitors": one("SELECT COUNT(DISTINCT visitor_id) FROM enquiries WHERE ts>=?", co),
        "enq_open": one("SELECT COUNT(*) FROM enquiries WHERE status='new'"),
        "products": one("SELECT COUNT(*) FROM products WHERE active=1"),
        "visits_today": one("SELECT COUNT(*) FROM visits WHERE ts>=?", datetime.now().strftime("%Y-%m-%d")),
    }
    top_viewed = rows(conn.execute(
        """SELECT p.id, p.name, p.brand, c.name AS category, COUNT(*) AS n FROM events e
           JOIN products p ON p.id=e.product_id LEFT JOIN categories c ON c.id=p.category_id
           WHERE e.type='view' AND e.ts>=? GROUP BY p.id ORDER BY n DESC LIMIT 10""", (co,)))
    top_enquired = rows(conn.execute(
        """SELECT p.id, p.name, p.brand, c.name AS category, COUNT(*) AS n,
                  SUM(q.channel='whatsapp') AS wa, SUM(q.channel='email') AS em FROM enquiries q
           JOIN products p ON p.id=q.product_id LEFT JOIN categories c ON c.id=p.category_id
           WHERE q.ts>=? GROUP BY p.id ORDER BY n DESC LIMIT 10""", (co,)))
    cities = rows(conn.execute(
        """SELECT MIN(v.city) AS city, COUNT(DISTINCT v.id) AS n FROM visits x JOIN visitors v ON v.id=x.visitor_id
           WHERE x.ts>=? GROUP BY lower(trim(v.city)) ORDER BY n DESC LIMIT 8""", (co,)))
    cat_views = rows(conn.execute(
        """SELECT c.name AS category, COUNT(e.id) AS n FROM categories c
           LEFT JOIN products p ON p.category_id=c.id
           LEFT JOIN events e ON e.product_id=p.id AND e.type='view' AND e.ts>=?
           GROUP BY c.id ORDER BY n DESC""", (co,)))
    span = days if 0 < days <= 90 else 30
    start = datetime.now().date() - timedelta(days=span - 1)
    series = {}
    for label, sql in (("visits", "SELECT substr(ts,1,10) d, COUNT(*) n FROM visits WHERE ts>=? GROUP BY d"),
                       ("views", "SELECT substr(ts,1,10) d, COUNT(*) n FROM events WHERE type='view' AND ts>=? GROUP BY d"),
                       ("enquiries", "SELECT substr(ts,1,10) d, COUNT(*) n FROM enquiries WHERE ts>=? GROUP BY d")):
        series[label] = {r["d"]: r["n"] for r in conn.execute(sql, (start.isoformat(),))}
    trend = []
    for i in range(span):
        d = (start + timedelta(days=i)).isoformat()
        trend.append({"date": d, "visits": series["visits"].get(d, 0),
                      "views": series["views"].get(d, 0), "enquiries": series["enquiries"].get(d, 0)})
    recent = rows(conn.execute(
        """SELECT q.id, q.ts, q.channel, q.status, v.name, v.mobile, v.city, p.name AS product FROM enquiries q
           LEFT JOIN visitors v ON v.id=q.visitor_id LEFT JOIN products p ON p.id=q.product_id
           ORDER BY q.id DESC LIMIT 8"""))
    return {"days": days, "kpi": kpi, "top_viewed": top_viewed, "top_enquired": top_enquired,
            "cities": cities, "category_views": cat_views, "trend": trend, "recent_enquiries": recent}

# ---------- admin: customers & enquiries

VISITOR_SQL = """SELECT v.id, v.name, v.mobile, v.city, v.first_seen, v.last_seen, v.visits,
       (SELECT COUNT(*) FROM events e WHERE e.visitor_id=v.id AND e.type='view') AS views,
       (SELECT COUNT(*) FROM enquiries q WHERE q.visitor_id=v.id) AS enquiries
       FROM visitors v WHERE (?='' OR v.name LIKE ? OR v.mobile LIKE ? OR v.city LIKE ?)
       ORDER BY v.last_seen DESC"""

ENQUIRY_SQL = """SELECT q.id, q.ts, q.channel, q.status, q.note, q.message, v.name, v.mobile, v.city,
       p.id AS product_id, p.name AS product, p.price FROM enquiries q
       LEFT JOIN visitors v ON v.id=q.visitor_id LEFT JOIN products p ON p.id=q.product_id
       WHERE (?='' OR q.status=?) AND (?='' OR v.name LIKE ? OR v.mobile LIKE ? OR p.name LIKE ? OR v.city LIKE ?)
       ORDER BY q.id DESC"""


def visitor_rows(conn, q):
    like = "%" + q + "%"
    return rows(conn.execute(VISITOR_SQL, (q, like, like, like)))


def enquiry_rows(conn, status, q):
    like = "%" + q + "%"
    return rows(conn.execute(ENQUIRY_SQL, (status, status, q, like, like, like, like)))


@route("GET", "/api/admin/visitors", auth=True)
def api_visitors(req, conn, body):
    return {"visitors": visitor_rows(conn, clean(req.q("q", ""), 60))}


@route("GET", "/api/admin/visitors.csv", auth=True)
def api_visitors_csv(req, conn, body):
    data = visitor_rows(conn, "")
    cols = ["name", "mobile", "city", "first_seen", "last_seen", "visits", "views", "enquiries"]
    return ("csv", "customers-%s.csv" % datetime.now().strftime("%Y%m%d"), cols, data)


@route("GET", "/api/admin/enquiries", auth=True)
def api_enquiries(req, conn, body):
    return {"enquiries": enquiry_rows(conn, clean(req.q("status", ""), 20), clean(req.q("q", ""), 60))}


@route("GET", "/api/admin/enquiries.csv", auth=True)
def api_enquiries_csv(req, conn, body):
    data = enquiry_rows(conn, "", "")
    cols = ["ts", "name", "mobile", "city", "product", "price", "channel", "status", "note"]
    return ("csv", "enquiries-%s.csv" % datetime.now().strftime("%Y%m%d"), cols, data)


@route("PUT", r"/api/admin/enquiries/(\d+)", auth=True)
def api_enquiry_update(req, conn, body, eid):
    status = body.get("status")
    if status not in ("new", "contacted", "converted", "closed"):
        raise ApiError("Invalid status")
    conn.execute("UPDATE enquiries SET status=?, note=? WHERE id=?", (status, clean_text(body.get("note"), 500), int(eid)))
    conn.commit()
    return {"ok": True}

# ---------- admin: products


def product_payload(conn, body):
    name = clean(body.get("name"), 160)
    if not name:
        raise ApiError("Product name is required.")
    cat = to_int(body.get("category_id"))
    if not cat or not conn.execute("SELECT 1 FROM categories WHERE id=?", (cat,)).fetchone():
        raise ApiError("Please choose a category.")
    sub = to_int(body.get("subcategory_id"))
    if sub and not conn.execute("SELECT 1 FROM subcategories WHERE id=? AND category_id=?", (sub, cat)).fetchone():
        raise ApiError("Sub-category does not belong to the chosen category.")
    specs = [[clean(k, 80), clean(v, 300)] for k, v in (body.get("specs") or []) if clean(k, 80)]
    highlights = [clean(h, 200) for h in (body.get("highlights") or []) if clean(h, 200)]
    images = [i for i in (body.get("images") or []) if isinstance(i, str) and re.fullmatch(r"/uploads/[\w.-]+", i)]
    return {
        "category_id": cat, "subcategory_id": sub, "name": name,
        "brand": clean(body.get("brand"), 60), "model": clean(body.get("model"), 80),
        "short": clean(body.get("short"), 240), "description": clean_text(body.get("description"), 4000),
        "price": to_int(body.get("price")), "mrp": to_int(body.get("mrp")),
        "specs": json.dumps(specs[:60]), "highlights": json.dumps(highlights[:12]), "images": json.dumps(images[:10]),
        "badge": clean(body.get("badge"), 30), "in_stock": 1 if body.get("in_stock") else 0,
        "active": 1 if body.get("active") else 0, "featured": 1 if body.get("featured") else 0,
        "representative": 1 if body.get("representative") else 0,
    }


@route("GET", "/api/admin/products", auth=True)
def api_products(req, conn, body):
    prods = [product_out(r) for r in conn.execute(
        """SELECT p.*, (SELECT COUNT(*) FROM events e WHERE e.product_id=p.id AND e.type='view') AS views,
                  (SELECT COUNT(*) FROM enquiries q WHERE q.product_id=p.id) AS enquiries
           FROM products p ORDER BY p.category_id, p.subcategory_id, p.id""")]
    return {"products": prods}


@route("POST", "/api/admin/products", auth=True)
def api_product_create(req, conn, body):
    d = product_payload(conn, body)
    d["created_at"] = d["updated_at"] = now()
    cols = ",".join(d)
    pid = conn.execute("INSERT INTO products(%s) VALUES(%s)" % (cols, ",".join("?" * len(d))), tuple(d.values())).lastrowid
    conn.commit()
    return {"ok": True, "id": pid}


@route("PUT", r"/api/admin/products/(\d+)", auth=True)
def api_product_update(req, conn, body, pid):
    d = product_payload(conn, body)
    d["updated_at"] = now()
    conn.execute("UPDATE products SET %s WHERE id=?" % ",".join(k + "=?" for k in d), (*d.values(), int(pid)))
    conn.commit()
    return {"ok": True}


@route("PATCH", r"/api/admin/products/(\d+)", auth=True)
def api_product_toggle(req, conn, body, pid):
    for field in ("active", "in_stock", "featured"):
        if field in body:
            conn.execute("UPDATE products SET %s=?, updated_at=? WHERE id=?" % field,
                         (1 if body[field] else 0, now(), int(pid)))
    conn.commit()
    return {"ok": True}


@route("DELETE", r"/api/admin/products/(\d+)", auth=True)
def api_product_delete(req, conn, body, pid):
    conn.execute("DELETE FROM products WHERE id=?", (int(pid),))
    conn.commit()
    return {"ok": True}


@route("POST", "/api/admin/upload", auth=True)
def api_upload(req, conn, body):
    data = str(body.get("data") or "")
    m = re.match(r"data:[\w/+.-]+;base64,(.*)$", data, re.S)
    try:
        raw = base64.b64decode(m.group(1) if m else data, validate=False)
    except ValueError:
        raise ApiError("Could not read the image.")
    if len(raw) > 8 * 1024 * 1024:
        raise ApiError("Image is larger than 8 MB.")
    if raw[:3] == b"\xff\xd8\xff":
        ext = ".jpg"
    elif raw[:8] == b"\x89PNG\r\n\x1a\n":
        ext = ".png"
    elif raw[:4] == b"RIFF" and raw[8:12] == b"WEBP":
        ext = ".webp"
    elif raw[:6] in (b"GIF87a", b"GIF89a"):
        ext = ".gif"
    else:
        raise ApiError("Only JPG, PNG, WEBP or GIF images are allowed.")
    name = uuid.uuid4().hex + ext
    with open(os.path.join(UPLOADS, name), "wb") as f:
        f.write(raw)
    return {"url": "/uploads/" + name}

# ---------- admin: categories


@route("GET", "/api/admin/categories", auth=True)
def api_categories(req, conn, body):
    cats = rows(conn.execute(
        "SELECT c.*, (SELECT COUNT(*) FROM products p WHERE p.category_id=c.id) AS products FROM categories c ORDER BY sort, id"))
    subs = rows(conn.execute(
        "SELECT s.*, (SELECT COUNT(*) FROM products p WHERE p.subcategory_id=s.id) AS products FROM subcategories s ORDER BY sort, id"))
    return {"categories": cats, "subcategories": subs}


def category_payload(body):
    name = clean(body.get("name"), 60)
    if not name:
        raise ApiError("Category name is required.")
    color = lambda v, d: v if re.fullmatch(r"#[0-9a-fA-F]{6}", str(v or "")) else d
    return {"name": name, "icon": clean(body.get("icon") or "box", 30), "tagline": clean(body.get("tagline"), 140),
            "color1": color(body.get("color1"), "#4338ca"), "color2": color(body.get("color2"), "#06b6d4"),
            "sort": to_int(body.get("sort"), 0), "showcase": image_url(body.get("showcase"))}


@route("POST", "/api/admin/categories", auth=True)
def api_category_create(req, conn, body):
    d = category_payload(body)
    slug = slugify(d["name"])
    while conn.execute("SELECT 1 FROM categories WHERE slug=?", (slug,)).fetchone():
        slug += "-" + uuid.uuid4().hex[:3]
    d["slug"] = slug
    cid = conn.execute("INSERT INTO categories(%s) VALUES(%s)" % (",".join(d), ",".join("?" * len(d))), tuple(d.values())).lastrowid
    conn.commit()
    return {"ok": True, "id": cid}


@route("PUT", r"/api/admin/categories/(\d+)", auth=True)
def api_category_update(req, conn, body, cid):
    d = category_payload(body)
    conn.execute("UPDATE categories SET %s WHERE id=?" % ",".join(k + "=?" for k in d), (*d.values(), int(cid)))
    conn.commit()
    return {"ok": True}


@route("DELETE", r"/api/admin/categories/(\d+)", auth=True)
def api_category_delete(req, conn, body, cid):
    if conn.execute("SELECT 1 FROM products WHERE category_id=?", (int(cid),)).fetchone():
        raise ApiError("Move or delete the products in this category first.")
    conn.execute("DELETE FROM categories WHERE id=?", (int(cid),))
    conn.commit()
    return {"ok": True}


@route("POST", "/api/admin/subcategories", auth=True)
def api_sub_create(req, conn, body):
    cid = to_int(body.get("category_id"))
    name = clean(body.get("name"), 60)
    if not name or not cid:
        raise ApiError("Sub-category name and category are required.")
    sid = conn.execute("INSERT INTO subcategories(category_id,name,icon,sort) VALUES(?,?,?,?)",
                       (cid, name, clean(body.get("icon") or "box", 30), to_int(body.get("sort"), 99))).lastrowid
    conn.commit()
    return {"ok": True, "id": sid}


@route("PUT", r"/api/admin/subcategories/(\d+)", auth=True)
def api_sub_update(req, conn, body, sid):
    name = clean(body.get("name"), 60)
    if not name:
        raise ApiError("Sub-category name is required.")
    conn.execute("UPDATE subcategories SET name=?, icon=? WHERE id=?", (name, clean(body.get("icon") or "box", 30), int(sid)))
    conn.commit()
    return {"ok": True}


@route("DELETE", r"/api/admin/subcategories/(\d+)", auth=True)
def api_sub_delete(req, conn, body, sid):
    if conn.execute("SELECT 1 FROM products WHERE subcategory_id=?", (int(sid),)).fetchone():
        raise ApiError("Move or delete the products in this sub-category first.")
    conn.execute("DELETE FROM subcategories WHERE id=?", (int(sid),))
    conn.commit()
    return {"ok": True}

# ---------- admin: settings


@route("GET", "/api/admin/settings", auth=True)
def api_settings(req, conn, body):
    return {"settings": get_settings(conn), "version": VERSION, "released": RELEASED, "data_folder": DATA}


@route("PUT", "/api/admin/settings", auth=True)
def api_settings_save(req, conn, body):
    for k in DEFAULT_SETTINGS:
        if k in body:
            v = clean(body[k], 300)
            if k == "whatsapp":
                v = re.sub(r"\D", "", v)
                if len(v) == 10:
                    v = "91" + v
                if not re.fullmatch(r"\d{11,15}", v):
                    raise ApiError("WhatsApp number must include country code, e.g. 919876543210.")
            if k == "email" and not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", v):
                raise ApiError("Please enter a valid email address.")
            if k == "website" and v:
                if not re.match(r"https?://", v, re.I):
                    v = "https://" + v
                if not re.fullmatch(r"https?://[\w.-]+\.[a-z]{2,}(/[\w./%#?=&-]*)?", v, re.I):
                    raise ApiError("Please enter a valid website, e.g. www.yourshop.com")
            if k == "show_prices":
                v = "1" if body[k] in (True, "1", 1, "true") else "0"
            conn.execute("INSERT OR REPLACE INTO settings(key,value) VALUES(?,?)", (k, v))
    conn.commit()
    return {"ok": True}

# --------------------------------------------------------------- HTTP handler


class Request:
    """Transport-neutral request used by both the built-in server and the WSGI entry point (wsgi.py)."""

    def __init__(self, method, path, query, headers, client_addr, read):
        self.method, self.path = method, path
        self.query = parse_qs(query or "")
        self.headers = headers          # anything with .get(name, default)
        self.client_address = (client_addr or "", 0)
        self._read = read               # read(n) -> bytes
        self.set_cookie = None

    def client_ip(self):
        fwd = self.headers.get("X-Forwarded-For")
        return fwd.split(",")[0].strip() if fwd else self.client_address[0]

    def secure_flag(self):
        """Mark the session cookie Secure when served over HTTPS (directly or behind a proxy)."""
        https = os.environ.get("COOKIE_SECURE") == "1" or (self.headers.get("X-Forwarded-Proto") or "").lower() == "https"
        return "; Secure" if https else ""

    def rate_check(self):
        if not public_limiter.allow(self.client_ip()):
            raise ApiError("Too many requests, slow down.", 429)

    def q(self, key, default=""):
        return self.query.get(key, [default])[0]

    def read_body(self):
        length = int(self.headers.get("Content-Length") or 0)
        if length > MAX_BODY:
            raise ApiError("Request too large.", 413)
        if not length:
            return {}
        if "application/json" not in (self.headers.get("Content-Type") or ""):
            raise ApiError("JSON body expected.", 415)
        try:
            data = json.loads(self._read(length).decode("utf-8"))
        except ValueError:
            raise ApiError("Invalid JSON.")
        if not isinstance(data, dict):
            raise ApiError("Invalid request.")
        return data

    def require_admin(self, conn):
        c = cookies.SimpleCookie(self.headers.get("Cookie") or "")
        token = c["llsess"].value if "llsess" in c else ""
        row = conn.execute("SELECT a.* FROM sessions s JOIN admins a ON a.id=s.admin_id WHERE s.token=? AND s.expires>?",
                           (token, time.time())).fetchone() if token else None
        if not row:
            raise ApiError("Please log in.", 401)
        self.admin, self.session_token = row, token


def json_response(obj, code=200):
    data = json.dumps(obj, ensure_ascii=False, default=str).encode("utf-8")
    return code, [("Content-Type", "application/json; charset=utf-8"), ("Cache-Control", "no-store")], data


def csv_response(filename, cols, data):
    buf = io.StringIO()
    w = csv.writer(buf)
    w.writerow([c.replace("_", " ").title() for c in cols])
    for r in data:
        w.writerow([csv_safe(r.get(c)) for c in cols])
    payload = ("﻿" + buf.getvalue()).encode("utf-8")  # BOM so Excel opens UTF-8 correctly
    return 200, [("Content-Type", "text/csv; charset=utf-8"), ("Cache-Control", "no-store"),
                 ("Content-Disposition", 'attachment; filename="%s"' % filename)], payload


def static_response(path):
    if path in ("", "/"):
        path = "/index.html"
    elif path in ("/admin", "/admin/"):
        path = "/admin.html"
    if path.startswith("/uploads/"):
        root, rel = UPLOADS, path[len("/uploads/"):]
    else:
        root, rel = PUBLIC, path.lstrip("/")
    full = os.path.normpath(os.path.join(root, rel))
    if not full.startswith(root + os.sep) or not os.path.isfile(full):
        return json_response({"error": "Not found"}, 404)
    ext = os.path.splitext(full)[1].lower()
    with open(full, "rb") as f:
        data = f.read()
    headers = [("Content-Type", MIME.get(ext, "application/octet-stream"))]
    if root == UPLOADS:
        headers += [("Cache-Control", "public, max-age=604800"),
                    ("Content-Security-Policy", "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'")]
    else:
        headers.append(("Cache-Control", "no-cache"))
    if path == "/admin.html":
        headers.append(("X-Frame-Options", "DENY"))
    return 200, headers, data


def api_response(req):
    for m, rx, auth, fn in ROUTES:
        if m != req.method:
            continue
        match = rx.match(req.path)
        if not match:
            continue
        body = req.read_body() if req.method in ("POST", "PUT", "PATCH") else {}
        conn = connect()
        try:
            if auth:
                req.require_admin(conn)
            result = fn(req, conn, body, *match.groups())
        finally:
            conn.close()
        if isinstance(result, tuple) and result[0] == "csv":
            return csv_response(*result[1:])
        return json_response(result)
    raise ApiError("Not found", 404)


def handle_request(req):
    """Run one request through the app. Returns (status_code, headers, body_bytes)."""
    try:
        if req.path.startswith("/api/"):
            code, headers, body = api_response(req)
        elif req.method in ("GET", "HEAD"):
            code, headers, body = static_response(req.path)
        else:
            code, headers, body = json_response({"error": "Not found"}, 404)
    except ApiError as e:
        code, headers, body = json_response({"error": e.msg}, e.code)
    except Exception:
        traceback.print_exc()
        code, headers, body = json_response({"error": "Something went wrong on the server."}, 500)
    headers = headers + [("Content-Length", str(len(body))), ("X-Content-Type-Options", "nosniff"),
                         ("Referrer-Policy", "same-origin")]
    if req.set_cookie:
        headers.append(("Set-Cookie", req.set_cookie))
    return code, headers, body


class Handler(BaseHTTPRequestHandler):
    """Built-in web server (used by `python server.py`)."""
    server_version = "LLCatalogue/" + VERSION
    sys_version = ""

    def log_message(self, fmt, *args):
        if os.environ.get("LL_LOG"):
            super().log_message(fmt, *args)

    def _run(self, method):
        u = urlparse(self.path)
        req = Request(method, u.path, u.query, self.headers, self.client_address[0], self.rfile.read)
        code, headers, body = handle_request(req)
        try:
            self.send_response(code)
            for k, v in headers:
                self.send_header(k, v)
            self.end_headers()
            if method != "HEAD":
                self.wfile.write(body)
        except (BrokenPipeError, ConnectionResetError):
            pass

    def do_GET(self):
        self._run("GET")

    def do_HEAD(self):
        self._run("HEAD")

    def do_POST(self):
        self._run("POST")

    def do_PUT(self):
        self._run("PUT")

    def do_PATCH(self):
        self._run("PATCH")

    def do_DELETE(self):
        self._run("DELETE")


def main():
    first = init_db()
    srv = ThreadingHTTPServer((HOST, PORT), Handler)
    line = "=" * 62
    print(line)
    print("  %s" % APP_NAME)
    print("  Version %s  (released %s)" % (VERSION, RELEASED))
    print(line)
    print("  Catalogue : http://localhost:%d/" % PORT)
    print("  Admin     : http://localhost:%d/admin" % PORT)
    if first:
        print("  First run : admin login created -> username '%s', password '%s'" % (DEFAULT_ADMIN_USER, first))
        print("              (also saved in data/first-login.txt) Change it right away in Admin > Settings.")
    print("  Data      : %s" % DATA)
    print("  Press Ctrl+C to stop.")
    print(line)
    try:
        srv.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")


if __name__ == "__main__":
    main()
