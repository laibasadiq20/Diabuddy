# DiaBuddy — Complete Project (Backend + Frontend with 3D Flip Auth)

This is your full project, ready to run. The backend is unchanged. The
frontend has the deep-green/peach theme plus a new 3D flip-card animation
on the Login/Register screen — see `FLIP_CARD_CHANGES.md` for exactly what
changed and how it works.

## What you need before running this

- **Node.js** 18+ installed
- **MongoDB** — either a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster, or MongoDB running locally
- (Optional) A Gmail account if you want real OTP/password-reset emails to send

## 1. Backend setup

```bash
cd BACKEND
npm install
cp .env.example .env
```

Open `.env` and fill in:

```
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/diabuddy?retryWrites=true&w=majority
JWT_SECRET=any_long_random_string_you_make_up
EMAIL_USER=your_gmail_address@gmail.com
EMAIL_PASS=your_gmail_app_password
```

- `MONGO_URI` — from your MongoDB Atlas dashboard, or
  `mongodb://localhost:27017/diabuddy` for a local Mongo instance
- `JWT_SECRET` — make up any long random string
- `EMAIL_USER` / `EMAIL_PASS` — only needed for real verification emails;
  see `BACKEND/EMAIL_SETUP.md`. Can be left blank to start.

Start the backend:

```bash
npm start
```

Confirm it's alive:
```bash
curl http://localhost:5000/api/test
```

## 2. Frontend setup

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. `/api/*` requests are automatically proxied
to your backend on port 5000 — already configured in `vite.config.js`.

## 3. Try the flip card

On `http://localhost:5173/login`:
- Click **"Create a free account"** — the card flips 180° to reveal the
  Register form on its back face
- Click **"Already have an account? Sign In"** — it flips back
- Visiting `/register` directly (e.g. a bookmark or page refresh) shows
  the Register face immediately, no animation

## Project structure

```
diabuddy-complete/
├── BACKEND/                          ← Express + MongoDB API (unchanged)
│   └── ...
│
└── frontend/                         ← React + Vite + Tailwind
    └── src/
        ├── theme.js                  ← all colors/fonts in one place
        ├── components/
        │   ├── Logo.jsx
        │   ├── OrganicBackdrop.jsx
        │   └── auth/
        │       ├── LoginFormContent.jsx     ← NEW — login fields only
        │       └── RegisterFormContent.jsx  ← NEW — register fields only
        └── pages/
            ├── AuthFlipCard.jsx       ← NEW — the flip mechanism
            ├── Login.jsx              ← thin wrapper around AuthFlipCard
            ├── Register.jsx           ← thin wrapper around AuthFlipCard
            └── Dashboard.jsx, etc.
```

See `FLIP_CARD_CHANGES.md` for the full breakdown of what changed.
