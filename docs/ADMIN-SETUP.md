# Maldives.org staff workspace

The workspace lives at `/admin`. The public site uses its original content until a publisher releases a draft. The staff workspace uses Postgres for staff accounts, sessions and drafts.

## Set up the first owner

1. Configure the server variables from [`.env.example`](../.env.example). Use an independent database for each deployment environment. Generate `ADMIN_AUTH_SECRET` with `openssl rand -base64 48`. Set `ADMIN_ORIGIN` to the exact HTTPS origin with no trailing slash. Use `http://localhost:3000` for local development.
2. From a trusted terminal with `ADMIN_DATABASE_URL` set, apply the schema and register the first staff owner.

   ```bash
   npm run admin:setup -- owner@example.com
   ```

3. Configure a sign-in method below and start the site. The owner can grant editor and publisher access in Team. Revoking or changing a staff member's role ends their sessions.

## Password sign-in

Set `ADMIN_AUTH_MODE=password` in the server environment. From a trusted terminal, enter a 12–128 character password for each approved staff email. The setup command stores a salted hash and ends the staff member's existing sessions.

```bash
read -rs staff_password
printf '%s\n' "$staff_password" | npm run admin:setup -- staff@example.com --password
unset staff_password
```

Open `/admin` and sign in with the approved email and password. Keep individual passwords in the team password vault.

## Email-code sign-in

Set `ADMIN_AUTH_MODE=otp` or use the default mode. Verify a sending domain in Resend. Set `ADMIN_OTP_FROM` to a sender on that domain and `ADMIN_OTP_RESEND_KEY` to a sending-only key scoped to the domain. Keep the key and the database URL in the deployment environment and team password vault.

Open `/admin` and request a fresh eight-digit email code for each login. Codes expire in five minutes and allow three guesses. Staff sessions in either mode expire after four hours.

## Publish and review changes

Editors can save homepage changes, manage information pages and prepare footer or policy addenda. Open Preview draft to review the result. Publishers and owners can publish a draft. Undo, redo and restore work on the draft. To roll back a public change, restore the prior version and publish it.

The Affiliate Registry tracks manual approval, payment model, and review of commission, refund and support terms. Keep partner keys in the deployment's secret storage. The GitHub tab reads branch activity, commits and checks. The existing public `master` branch works with unauthenticated reads. A private repository can use `ADMIN_GITHUB_READ_TOKEN` with repository-scoped read access to Contents, Commit statuses and Checks. Vercel's deployment SHA appears when build metadata includes it.
