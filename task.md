# Tasks status

## Completed (security / product hardening)

- [x] Block client-supplied `role` on register (always `patient`)
- [x] Cookie-only JWT (no `sessionStorage` / response body token)
- [x] Align OTP TTL + UI timer with email copy (15 minutes)
- [x] Fix token checks on AuthFlipCard / Forgot / Reset (use AuthContext `user`)
- [x] `/register` opens register face (`startFlipped`)
- [x] Create Logs page
- [x] Admin console: overview, users, reports (ban/delete/verify/promote)
- [x] Unify Paper & Sky tokens (theme.js + index.css + auth screens)
- [x] Fix `tailwind.config.js`
- [x] Split CommunityFeed / PostDetails / Messages into components
- [x] Medical safety copy on insulin / glucose / calorie / BMI / footer / community
- [x] Remove dead code (MainLayout, App.css, CRA leftovers, unused Login/Register wrappers)
- [x] Update RUN_ME.md + implementation notes
- [x] Vite proxy → localhost:5000

## Still open (optional follow-ups)

- [ ] Rate-limit auth endpoints
- [ ] Wire Logs / Fitbit to backend models
- [ ] Automated tests
