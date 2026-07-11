# Email setup (Railway)

Railway **blocks outbound SMTP** (ports 465/587). Gmail App Passwords will time out on Railway.

Use an HTTPS email API instead.

## Option A — Resend (recommended)

1. Create a free account at https://resend.com
2. Create an API key
3. In Railway → Variables, add:
   - `RESEND_API_KEY=re_...`
4. Optional: verify your domain and set:
   - `EMAIL_FROM=DiaBuddy <noreply@yourdomain.com>`
5. Redeploy

Until a domain is verified, Resend may only allow sending to your own signup email when using `onboarding@resend.dev`.

## Option B — Brevo

1. Create a free account at https://www.brevo.com
2. Verify a sender email (can be your Gmail)
3. Create an API key (SMTP & API)
4. In Railway → Variables, add:
   - `BREVO_API_KEY=xkeysib-...`
   - `EMAIL_USER=your_verified_sender@gmail.com`
5. Redeploy

## Local development

Gmail SMTP still works on your laptop:

```env
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_16_char_app_password
```
