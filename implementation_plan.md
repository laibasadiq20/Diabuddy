# Implementation notes (current)

This file used to describe interactive Dashboard glucose/meal widgets and a Hub-only redesign. **Current product:**

- **Dashboard** is a navigation hub (Community, Toolbox, Logs, Fitbit, Messages, Account).
- **Logs** (`/logs`) is a local-device health log (glucose / meal / insulin) — not yet synced to Mongo models.
- **Community / Messages / Admin** are the primary server-backed modules.
- Auth uses **httpOnly cookies**; JWT is not returned to the client body.
- Admin console at `/admin`: stats, user management (ban/delete/role/verify-pro), report queue.

For how to run the stack, see [RUN_ME.md](./RUN_ME.md).
