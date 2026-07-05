# Implementation Plan: DiaBuddy Community Modules Frontend

Build a premium, beautiful, and feature-rich community modules frontend in React, integrated with the existing backend APIs. This includes a full discussion board (topics, posts, likes, comments, nested replies, polls, image attachments, best answers), a private messaging system (conversations, group chats, real-time message listing), and an admin moderation dashboard.

Additionally, this plan incorporates refinements requested by the user to fix navigation paths, handle user profiles correctly after registration/sign-in, create client-side interactive widgets for the dashboard modules, and build a beautiful "How to Use" walkthrough on the landing page.

## User Review Required

> [!IMPORTANT]
> - **Authentication Redirects & Navigation Flows**:
>   - Signing up or logging in now completes with OTP verification and redirects immediately to the Dashboard `/dashboard`.
>   - Clicking the "Diabuddy" logo in the Navbar will go to `/dashboard` if logged in, and `/` (Landing Page) if logged out.
>   - A direct link to the **Dashboard** will be added to the Navbar when logged in.
>   - The mobile menu will be fully responsive: if a user is logged in, they can view their avatar, dashboard link, direct messages, and log out directly from the mobile drawer.
> - **Interactive Companion Modules on Dashboard**:
>   - Instead of static "Coming Soon" lock overlays, the Glucose Tracker, Meal Tracker, and Health Goals will be fully interactable mock widgets in the browser. Users can log readings, add meals (with automatic macro recalculation), and tick off goals.
> - **Interactive How to Use Section**:
>   - The "How It Works" landing page section will be redesigned as an interactive step-by-step product walkthrough with visual mockups of each feature.

---

## Proposed Changes

### Backend Enhancements

We will add a secure endpoint to list/search registered users to enable starting private messages.

#### [MODIFY] [authController.js](file:///d:/Desktop/Diabuddy/BACKEND/controllers/authController.js)
- Add `searchUsers` controller to fetch users excluding the current user.
- Export `searchUsers`.

#### [MODIFY] [authRoutes.js](file:///d:/Desktop/Diabuddy/BACKEND/routes/authRoutes.js)
- Register `router.get('/users', protect, searchUsers)` endpoint.

---

### Frontend Core & Layouts

#### [MODIFY] [App.jsx](file:///d:/Desktop/Diabuddy/FRONTEND/src/App.jsx)
- Import new pages (`Dashboard`, `CommunityFeed`, `PostDetails`, `NewPost`, `Messages`, `AdminReports`).
- Define the React Router routes: `/dashboard`, `/community`, `/community/posts/:id`, `/community/new-post`, `/messages`, `/admin/reports`.
- Protect these routes (requires authenticated user, redirecting to `/login` if not authenticated).

#### [MODIFY] [Navbar.jsx](file:///d:/Desktop/Diabuddy/FRONTEND/src/components/Navbar.jsx)
- Modify Logo element to navigate to `/dashboard` for logged-in users, otherwise `/`.
- Render the profile avatar icon in the navbar header on mobile screens too (remove `hidden md:flex`).
- Add "Dashboard" link directly to the desktop navbar if logged in.
- Update the Mobile drawer menu so that when the user is logged in, they see menu buttons for Dashboard, Messages, and a prominent "Log Out" button instead of "Get Started".

#### [MODIFY] [Hero.jsx](file:///d:/Desktop/Diabuddy/FRONTEND/src/pages/LandingPage/sections/Hero.jsx)
- Check `user` state from `useAuth`.
- Change CTA buttons to "Go to Dashboard" and "Community Forum" for logged-in users, instead of prompting them to register or view section details.

#### [MODIFY] [HowItWorks.jsx](file:///d:/Desktop/Diabuddy/FRONTEND/src/pages/LandingPage/sections/HowItWorks.jsx)
- Enhance this section to be an interactive 4-step walkthrough:
  - Step 1: Discover & Risk Assessment
  - Step 2: Interactive Health Dashboard (glucose, macros, goals)
  - Step 3: Discussion Board & Peer support (polls, comments, answers)
  - Step 4: Private Direct Messages
- Render steps on the left, and a beautiful interactive/animated mock visual container of that feature on the right side.

---

### Frontend Dashboard Refinements

#### [MODIFY] [Dashboard.jsx](file:///d:/Desktop/Diabuddy/FRONTEND/src/pages/Dashboard/Dashboard.jsx)
- **Glucose Tracker**: Remove lock overlay. Add local React state representing glucose readings. Provide a mini form to add glucose readings, which will dynamically recalculate the stats and update the bar chart in real time.
- **Meal & Nutrition Tracker**: Remove lock overlay. Add local state to log daily meals and count total carbohydrate intake. Recalculate macro percentages (Carbs, Protein, Fat) and update progress circles.
- **Health Goals**: Remove lock overlay. Add interactive controls (buttons, checkboxes) to update daily progress (e.g. increase steps, toggle medication, complete meal logs) and watch the overall completion stats update.

---

## Verification Plan

### Automated Tests
- Run `npm run build` in `FRONTEND/` to verify compiling is clean with no issues.

### Manual Verification
1. **User Sign Up & Journey**: Register/Login, complete verification, ensure it redirects immediately to the Dashboard `/dashboard`.
2. **Logo and Navbar Navigation**:
   - Verify clicking the Logo on landing page or dashboard goes to `/dashboard` when logged in.
   - Verify the direct "Dashboard" link in the navbar works.
   - Test on mobile resolution and verify the mobile drawer contains Profile, Dashboard, Messages, and Logout links.
3. **Interactive Dashboard Companion Modules**:
   - Add blood sugar values (e.g. 125 mg/dL) and verify the stats and charts update.
   - Add preset foods or custom meals, verify daily carbs total and percentages update.
   - Toggle/update goal steps and tasks, verify progress bars fill up.
4. **How It Works Walkthrough**:
   - Scroll to the section on the landing page, click different steps, verify the mock visual panel on the right changes to present the corresponding feature mockup.
