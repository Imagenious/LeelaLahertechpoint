# Leela Laher Tech Point - Digital Catalogue

**Version 1.6.0** (released 2026-10-16)

An online catalogue for the showroom. Customers browse products by category, see pictures, specs and prices, and send an enquiry on WhatsApp or by email in one tap. The owner gets a password-protected admin panel with a visitor dashboard and a customer database.

Built in **Python** using only the standard library (`http.server` + `sqlite3`), so there's nothing to `pip install`.

## Start it

1. Install Python 3.9 or newer from python.org.
2. Double-click **`start.bat`**, or run:

```bash
python server.py
```

| Page | Address |
|---|---|
| Customer catalogue | http://localhost:8080/ |
| Admin panel | http://localhost:8080/admin |

**First login:** on the very first start the app creates the admin user `admin` with a **random password**. It's printed in the server window and saved in `data/first-login.txt`. Log in, **change it right away** in Admin > Settings, then delete that file. (To choose the first password yourself, set the `ADMIN_PASSWORD` environment variable before the first start.)

Customers on the same Wi-Fi as the computer can open `http://<this-computer's-IP>:8080/`.

## Version history
- **1.6.0** - About us photos in a larger square gold frame with corner accents; tap a photo to view it full size. Master / staff admin logins: the owner's login is the **Master** and can add, edit and remove staff logins in Admin > Settings > Team logins (staff can't manage logins). `reset_admin.py` resets the master login if the password is forgotten.
- **1.5.1** - Pre-deployment check (119 automated server checks plus customer and admin pages tested at phone and desktop sizes). Fixed: the privacy note on the welcome form could cover the City box and block typing. Admin login cookie is marked Secure when served over HTTPS. Added `wsgi.py` for PythonAnywhere. New installs get a random first admin password (no fixed default).
- **1.5.0** - "About us" tab with the company story and leadership profiles (Mr. Avinash Jain, CEO & Founder; Mr. Shaukat, Head of Operations), "Why customers choose us" and a visit-us section with directions. Text and team photos are editable in Admin > Settings > About us page. Store contact details, website and Gadag-area city suggestions added.
- **1.4.0** - Personal "Tech Genie" mascot: welcomes each new customer by name, time of day and city after they enter their details, then offers a 4-tip guided tour that spotlights categories, search, products and WhatsApp enquiry. Returning customers get a short "welcome back" once per visit, and a genie help button replays the tips anytime. Category tiles now show the product photo with a bold border in the category colour.
- **1.3.0** - Photo-realistic product renders (AI-generated, unbranded) orbit the homepage logo. Each category has a "Showcase picture" you can upload, replace or remove in Admin > Categories. Products get a "Pictures are representative" option that shows customers a "Representative image" note.
- **1.2.0** - Bright futuristic showroom homepage: sky-blue background with city skyline and glowing grid floor, holographic platform with the Leela Laher logo, category devices (CCTV camera, phone, TV, AC, headphones) orbiting in 3D, floating smartwatch and earbuds.
- **1.1.0** - New welcoming homepage: the Leela Laher logo (background removed) in the centre with the categories orbiting it, a liquid-gold animation, a personal greeting, a scrolling brands strip and showroom/help cards. Gold-and-black brand colours throughout.
- **1.0.0** - First release: catalogue, customer details form, WhatsApp/email enquiries, admin dashboard.

## What's included

### Customer catalogue
- A welcome form collects each customer's **name, mobile number and city** (with a consent tick box) before they browse. This builds your customer database.
- 5 starter categories with sub-categories:
  - **CCTV Cameras**: Dome, Bullet, Wi-Fi Smart, PTZ, DVR/NVR, Complete Kits
  - **Apple Products**: iPhone, MacBook, iPad, Apple Watch, AirPods & Accessories
  - **Televisions**: HD/Full HD, 4K, QLED & Mini-LED, OLED
  - **Air Conditioners**: Inverter Split, Window, Cassette & Commercial
  - **Computer Accessories**: Keyboards & Mice, Monitors, Storage, Printers, Networking, Headsets & Webcams, UPS
- Search, brand filter and sorting by price or discount.
- Product page with photos, price, MRP and discount %, highlights and a full spec table.
- **Enquire on WhatsApp**, **Enquire by Email** and **Call** buttons. The message is pre-filled with the product and the customer's details.
- Works on phones.

### Admin panel (login required)
- **Dashboard**: visits, unique visitors, new customers, product views, enquiries (WhatsApp vs email), enquiry rate, visits and enquiries per day, **most viewed products**, **most enquired products**, top cities and views by category. Filter by Today, 7, 30 or 90 days, or All time.
- **Enquiries**: every contact with the customer's details. Set the status (New, Contacted, Converted, Closed), add notes, reply on WhatsApp, export to CSV/Excel.
- **Customers**: the customer database (name, mobile, city, visits, views, enquiries), with search, WhatsApp message and CSV export.
- **Products**: add, edit, hide or delete products. Upload photos, edit specs and highlights, and toggle in-stock and featured.
- **Categories**: add or edit categories and sub-categories, with icons and colours.
- **Settings**: WhatsApp number, email, phone, address, hours, show/hide prices, change username and password, and version info.

## Important before going live
1. In **Settings**, set your real **WhatsApp number** (e.g. `919876543210`) and **email**.
2. The starter prices are **samples**. Update them under **Products**.
3. Upload real product photos. Until then, each product shows a generated illustration.
4. Back up the `data/` folder. It holds the database (`catalogue.db`) and the uploaded photos.

## Putting it on the internet
To reach customers outside the shop, run it on a small cloud server or VPS (any host that runs Python). Put it behind HTTPS, for example with Caddy or Nginx as a reverse proxy, or use Cloudflare Tunnel. Settings:
- `PORT` environment variable: port to listen on (default 8080)
- `ADMIN_PASSWORD` environment variable: initial admin password, used only on first run
- `COOKIE_SECURE=1` environment variable: mark the admin login cookie Secure (automatic when the proxy sends `X-Forwarded-Proto: https`)

## Deploying on PythonAnywhere

PythonAnywhere runs the catalogue through `wsgi.py` (same code as `python server.py`).

1. **Get the code.** Open a *Bash console* on PythonAnywhere and run:
   ```bash
   git clone https://github.com/<your-account>/<your-repo>.git ~/LL-Digital
   ```
2. **Create the web app.** In the *Web* tab choose **Add a new web app** > **Manual configuration** > the newest Python version.
3. **Point it at the catalogue.** Open the *WSGI configuration file* link on the Web tab, delete everything in it and paste:
   ```python
   import sys
   path = "/home/<your-username>/LL-Digital"
   if path not in sys.path:
       sys.path.insert(0, path)
   from wsgi import application
   ```
4. **Turn on HTTPS.** On the Web tab, switch **Force HTTPS** on.
5. **Reload** the web app and open `https://<your-username>.pythonanywhere.com/`.
6. **Bring your data (optional).** To keep your customers, enquiries, settings and photos, upload your local `data/` folder (`catalogue.db` and `uploads/`) to `/home/<your-username>/LL-Digital/data/` using the *Files* tab, then reload. Without it, the site starts fresh with the starter catalogue and a random admin password: open `LL-Digital/data/first-login.txt` in the *Files* tab to see it, log in, change it, then delete the file.
7. **Custom domain (www.leelalaher.tech).** This needs a paid PythonAnywhere plan. Add the domain on the Web tab and create the CNAME record it shows you at your domain provider.

**Updating later:** run `cd ~/LL-Digital && git pull` in a Bash console, then press **Reload** on the Web tab. Your `data/` folder is never touched by updates.

> The `data/` folder holds customer names and mobile numbers. It is excluded from Git (`.gitignore`) and must never be uploaded to GitHub.

## Forgot the admin password?
On the server (PythonAnywhere: a Bash console), run `cd ~/LL-Digital && python3 reset_admin.py` and choose a new master username and password.

## Files
```
server.py        web server, API and database (Python)
wsgi.py          entry point for hosts like PythonAnywhere
reset_admin.py   resets the master admin login from the command line
seed_data.py     starter categories and products (loaded on first run only)
start.bat        double-click launcher for Windows
public/          catalogue and admin pages (HTML/CSS/JS, icons, logo)
data/            created automatically: catalogue.db + uploads/
```
