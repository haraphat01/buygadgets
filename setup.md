# Admin Setup

How to create the first admin account and sign in to the admin dashboard.

## 1. Create the first admin account (Owner)

The very first admin account can only be created by running the database seed script — there's no public sign-up for admins, by design.

1. Open `.env` and set these three values (see `.env.example` for the full list of required variables):

   ```
   ADMIN_SEED_EMAIL="you@example.com"
   ADMIN_SEED_PASSWORD="a-strong-password"
   ADMIN_SEED_NAME="Store Owner"
   ```

   `ADMIN_SEED_NAME` is optional — it defaults to "Store Owner" if left blank.

2. Run the seed script:

   ```bash
   npm run db:seed
   ```

   This creates a Supabase Auth user with those credentials and gives it the `OWNER` role — the highest admin role in the app.

   The script is safe to re-run. If an account with that email already exists, it reuses it and just makes sure the `OWNER` role is set — but it will **not** update the password on an existing account. To change the Owner's password afterward, use "Forgot password" on the login page (see below) or update it directly in the Supabase dashboard.

## 2. Sign in

1. Go to **`/admin/login`** (e.g. `http://localhost:3000/admin/login` locally).
2. Sign in with `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD`.
3. You'll land on the dashboard at **`/admin`**.

Visiting any `/admin/*` page while signed out redirects you to `/admin/login` automatically. Signing in while already authenticated redirects you straight to `/admin`.

## 3. Add more admin accounts (optional)

Once signed in as the Owner:

1. Go to **Users** in the admin sidebar (`/admin/users`).
2. Click **New User**.
3. Fill in their email, a temporary password, full name, and role:
   - **Admin** — full access to the admin dashboard.
   - **Staff** — same access as Admin today (there's no fine-grained permission system yet — see "Notes" below).
4. Share the email/password with them directly; there's no invite email.

Only the Owner can create, edit, or delete other admin accounts — the **New User** button and the Users page itself are hidden/blocked for non-Owner roles.

## Notes

- Admin accounts are completely separate from customer accounts (`/account/*`). The same email could theoretically be used for both, but they're unrelated logins.
- There's no self-serve "forgot password" flow for admins yet — if an admin gets locked out, reset their password from the Supabase dashboard (Authentication → Users) or have the Owner delete and recreate their account from the Users page.
- Roles today are informational/organizational (Owner vs. Admin vs. Staff) rather than enforcing different permissions per section — anyone who can sign in to `/admin` can access every admin page except the Users page, which is Owner-only.
