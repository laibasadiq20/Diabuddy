# DiaBuddy — Run guide

Diabetes companion app: React (Vite) frontend + Express/MongoDB backend.
Community, auth, toolbox calculators, local health logs, and an admin console.

## Prerequisites

- **Node.js** 18+
- **MongoDB** — Atlas or local (`mongodb://localhost:27017/diabuddy`)
- (Optional) Email credentials for OTP / password-reset — see `BACKEND/EMAIL_SETUP.md`

## 1. Backend

```bash
cd BACKEND
npm install
cp .env.example .env
```

Fill in `.env`:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/diabuddy
JWT_SECRET=a_long_random_string
CLIENT_URL=http://localhost:5173
# Optional for local http cookies (default: secure only in production)
# COOKIE_SECURE=false
EMAIL_USER=
EMAIL_PASS=
# Or GMAIL_SCRIPT_URL / BREVO_API_KEY / RESEND_API_KEY — see EMAIL_SETUP.md
```

Start:

```bash
npm start
```

Health check: `curl http://localhost:5000/api/test`

## 2. Frontend

```bash
cd FRONTEND
npm install
npm run dev
```

Open `http://localhost:5173`.

Vite proxies `/api/*` to **`http://localhost:5000`** (your local backend).

Production: Vercel rewrites `/api` to the Railway backend (see `FRONTEND/vercel.json`).

## 3. Auth & admin notes

- JWT is stored in an **httpOnly cookie** only (not in `sessionStorage` / `localStorage`).
- New accounts always get `role: patient`. Promote admins from the Admin console (or set role in MongoDB once).
- Admin console: `/admin` (Overview · Users · Reports) — ban/delete users, verify pros, resolve reports.

## 4. Project layout

```
Diabuddy/
├── BACKEND/          Express + MongoDB API
└── FRONTEND/         React + Vite + Tailwind
    └── src/
        ├── theme.js              Paper & Sky design tokens
        ├── context/AuthContext.jsx
        ├── pages/
        │   ├── Dashboard/
        │   ├── Community/
        │   ├── Messages/
        │   ├── Toolbox/
        │   ├── Logs/             Local device logs (glucose / meal / insulin)
        │   ├── Admin/            Site console
        │   └── login/AuthFlipCard.jsx
        └── ...
```

## 5. Current product shape

| Area | Status |
|------|--------|
| Landing / Learn | Live |
| Auth (OTP, reset) | Live |
| Dashboard hub | Live (tiles to modules) |
| Community + DMs | Live |
| Toolbox | Live (client-side; educational disclaimers) |
| Logs | Live locally (browser storage; no cloud API yet) |
| Fitbit / Reminders | UI stubs |
| Admin console | Live |

OTP codes expire in **15 minutes** (matches email copy).
