# 3D Flip-Card Auth — What Changed

The backend is untouched. Within `frontend/`, here's exactly what changed
to add the flip animation.

## ✅ New files

| File | Purpose |
|---|---|
| `frontend/src/pages/AuthFlipCard.jsx` | The flip mechanism. Holds `isFlipped` state, renders the fixed branding panel once, and renders both the Login and Register form as two faces of one 3D card. |
| `frontend/src/components/auth/LoginFormContent.jsx` | Just the login form fields/logic — no page chrome, so it can sit inside the flip card's front face. Same `fetch('/api/auth/login')` call and validation as before. |
| `frontend/src/components/auth/RegisterFormContent.jsx` | Just the register form fields/logic, restyled to match the login form's exact spacing/typography (13px labels, 8px label-to-input gap, 13px button padding) so both faces look like one continuous design. Same `fetch('/api/auth/register')` call and validation as before. |

## ✅ Changed files

| File | What changed |
|---|---|
| `frontend/src/pages/Login.jsx` | Replaced with a thin wrapper: `<AuthFlipCard startFlipped={false} />`. The route still exists and works exactly as before from the user's perspective. |
| `frontend/src/pages/Register.jsx` | Replaced with a thin wrapper: `<AuthFlipCard startFlipped={true} />`. Visiting `/register` directly still shows the register form immediately — no animation plays on direct page load, only on in-app switches. |
| `frontend/src/index.css` | Added the 3D flip CSS utilities (`flip-perspective`, `flip-card-inner`, `flip-face`, `flip-face-back`, `is-flipped`) — see "How the 3D flip works" below. Also fixed a pre-existing bug (see below). |
| `frontend/src/pages/Dashboard.jsx` | One-line fix to the sidebar — see "Bug fix" below. Nothing else touched. |
| `frontend/src/pages/Landing.jsx` | One-line fix to the nav — see "Bug fix" below. Nothing else touched. |

## How the 3D flip works

Three CSS utility classes in `index.css`, applied as plain Tailwind-style
classNames (no inline styles needed for the mechanics):

- **`.flip-perspective`** — `perspective: 1800px` on the outer wrapper, giving the rotation depth.
- **`.flip-card-inner`** — the rotating element. `transform-style: preserve-3d` plus a `transform: transform 700ms cubic-bezier(0.4, 0, 0.2, 1)` transition. Gets `.is-flipped` added (→ `rotateY(180deg)`) when React state `isFlipped` is `true`.
- **`.flip-face`** / **`.flip-face-back`** — both faces are absolutely positioned on top of each other inside the rotating element; `backface-visibility: hidden` hides whichever face is turned away from the viewer; the back face is pre-rotated 180° so it reads right-side-up once the card finishes flipping.

`AuthFlipCard.jsx` holds the only state involved:

```js
const [isFlipped, setIsFlipped] = useState(startFlipped);
```

Clicking "Create a free account" or "Already have an account? Sign In"
just flips this boolean — no `navigate()`, no remount, no React Router
involved in the switch itself. The URL bar is kept in sync purely
cosmetically via `window.history.replaceState()`, so a refresh on
`/register` still shows the right face, but that's separate from the flip
animation itself.

A `prefers-reduced-motion` media query disables the transition for users
who've asked their OS to reduce motion.

## Bug fix (found while testing responsiveness)

While verifying the flip card was "fully responsive" as required, I found
that the branding panel wasn't actually hiding on mobile — it has
`className="hidden md:flex"` (display:none below 768px, flex above) but
also had `display: 'flex'` set in its **inline** `style` prop. Inline
styles always win over stylesheet classes in CSS, so the `hidden` class
was silently never applying, and the branding panel was rendering on top
of the auth card on phones.

This was a pre-existing bug — it also existed in the same pattern on
`Landing.jsx`'s nav and `Dashboard.jsx`'s sidebar (both also had `display:
'flex'` inline alongside a `hidden ...:flex` className). Fixed all three by
removing the inline `display` property and letting the className alone
control visibility. Nothing else in either file was touched.

## Verified

- Real 3D `rotateY` transform confirmed mid-animation (not just before/after states)
- Flip → Register, flip back → Login, both confirmed
- Direct visit to `/register` shows the register face immediately with no animation
- Desktop (1440px) and mobile (390px) viewports both confirmed correct
- All modified/new files pass a clean esbuild syntax/bundle check
