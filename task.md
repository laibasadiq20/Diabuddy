# Tasks: DiaBuddy Community Modules & Interactive Features Refinement

- [x] **Phase 1: Navbar & Routing Flows**
  - [x] Update Logo click in `Navbar.jsx` to navigate to `/dashboard` if logged in, `/` if not
  - [x] Add direct "Dashboard" navigation link in desktop view of `Navbar.jsx`
  - [x] Make Profile Avatar button always visible (remove `hidden md:flex`) in `Navbar.jsx`
  - [x] Enhance mobile drawer menu in `Navbar.jsx` with user-profile links and a "Log Out" button
  - [x] Make sure Hero CTAs in `Hero.jsx` adjust when user is logged in
- [x] **Phase 2: Interactive Dashboard Modules**
  - [x] Remove locking overlay from **Glucose Tracker** and implement full interactive client-side logging (log readings, update stats and dynamic bar chart)
  - [x] Remove locking overlay from **Meal & Nutrition Tracker** and implement interactive food selection and custom carb logging (update macro progress circles)
  - [x] Remove locking overlay from **Health Goals** and implement interactive target step triggers and goal status checklists
- [x] **Phase 3: Interactive How to Use Stepper**
  - [x] Redesign `HowItWorks.jsx` with an interactive tab list/stepper on the left and a mock feature visual mockup card on the right
- [x] **Phase 4: Verification & Build**
  - [x] Run Vite production build check (`npm run build`) in `FRONTEND/`
  - [x] Verify OTP redirection and all navigation states
