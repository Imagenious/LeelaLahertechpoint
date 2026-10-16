"""
Reset the MASTER admin login (for when the password is forgotten).

Run it on the computer/server where the catalogue's data folder is:
    python reset_admin.py          (on PythonAnywhere: python3 reset_admin.py in ~/LL-Digital)

It asks for a username and a new password (typing is hidden), then signs out every admin session.
"""
import getpass
import os
import re
import sys

import server


def reset(username, password):
    if not re.fullmatch(r"[A-Za-z0-9_.@-]{3,40}", username):
        raise ValueError("Username may use letters, numbers and . _ @ - (3-40 characters).")
    if len(password) < 8 or not re.search(r"\d", password) or not re.search(r"[A-Za-z]", password):
        raise ValueError("Password must be at least 8 characters with letters and numbers.")
    if not os.path.isfile(server.DB_PATH):
        raise ValueError("No database found at %s - start the catalogue once first." % server.DB_PATH)
    conn = server.connect()
    try:
        server.migrate(conn)
        # reset the master (owner) login; fall back to the oldest login
        row = conn.execute("SELECT id FROM admins ORDER BY role='master' DESC, id LIMIT 1").fetchone()
        clash = conn.execute("SELECT id FROM admins WHERE username=? COLLATE NOCASE", (username,)).fetchone()
        if clash and (not row or clash["id"] != row["id"]):
            raise ValueError("Username '%s' already belongs to another login - choose a different one." % username)
        h, s = server.hash_pw(password)
        if row:
            conn.execute("UPDATE admins SET username=?, pw_hash=?, salt=?, pw_changed_at=?, role='master' WHERE id=?",
                         (username, h, s, server.now(), row["id"]))
        else:
            conn.execute("INSERT INTO admins(username,pw_hash,salt,created_at,pw_changed_at,role) VALUES(?,?,?,?,?,'master')",
                         (username, h, s, server.now(), server.now()))
        conn.execute("DELETE FROM sessions")
        conn.commit()
    finally:
        conn.close()
    first_login = os.path.join(server.DATA, "first-login.txt")
    if os.path.exists(first_login):
        os.remove(first_login)


def main():
    print("Leela Laher Tech Point - reset admin login")
    username = input("Admin username [admin]: ").strip() or "admin"
    password = getpass.getpass("New password (hidden): ")
    if password != getpass.getpass("Type it again: "):
        sys.exit("Passwords do not match - nothing changed.")
    try:
        reset(username, password)
    except ValueError as e:
        sys.exit("Not changed: %s" % e)
    print("Done. Log in at /admin as '%s' with the new password." % username)
    print("On PythonAnywhere, no reload is needed.")


if __name__ == "__main__":
    main()
