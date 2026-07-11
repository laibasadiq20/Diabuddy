# Email setup (no domain needed)

## Why Nodemailer alone fails on Railway

On your laptop, Nodemailer + Gmail App Password works.

On **Railway**, outbound SMTP ports **465/587 are blocked**, so the same
`EMAIL_USER` / `EMAIL_PASS` time out. That is a Railway network limit, not a bad password.

## Recommended for Railway (no domain): Google Apps Script

Uses your Gmail over **HTTPS**. No DNS / domain access needed.

### 1) Create the script
1. Open https://script.google.com → **New project**
2. Paste this code:

```javascript
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var expected = PropertiesService.getScriptProperties().getProperty('SECRET');

    if (!data.secret || data.secret !== expected) {
      return ContentService
        .createTextOutput(JSON.stringify({ ok: false, error: 'Unauthorized' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (!data.to || !data.subject) {
      return ContentService
        .createTextOutput(JSON.stringify({ ok: false, error: 'Missing to/subject' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    GmailApp.sendEmail(data.to, data.subject, data.text || '', {
      htmlBody: data.html || data.text || '',
      name: 'DiaBuddy Support',
    });

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

3. **Project Settings** (gear) → **Script properties** → Add:
   - Property: `SECRET`
   - Value: any long random string (e.g. `diabuddy_mail_7f3a9c`)

4. **Deploy** → **New deployment** → type **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Authorize the app when Google asks
6. Copy the **Web app URL** — it MUST look like:
   `https://script.google.com/macros/s/AKfycb.../exec`
   - Must end with **`/exec`** (not `/dev`)
   - Do **not** use the editor URL (`script.google.com/home/projects/...`)

### 2) Add Railway variables
```
GMAIL_SCRIPT_URL=https://script.google.com/macros/s/XXXX/exec
GMAIL_SCRIPT_SECRET=diabuddy_mail_7f3a9c
```
(use the same secret as in Script properties)

If you change the script later: **Deploy → Manage deployments → Edit (pencil) → New version → Deploy**, then keep the same URL.

### 3) Redeploy the backend

OTP / reset emails will send from the Google account that owns the Apps Script.

**If you see "Page Not Found" / Drive HTML in Railway logs:** the URL is wrong or access is not "Anyone". Fix the Web app URL and redeploy Railway.

---

## Local development (Nodemailer)

```env
EMAIL_USER=laiba18113@gmail.com
EMAIL_PASS=your_gmail_app_password
```

---

## Alternatives

| Provider | Domain needed? | Notes |
|----------|----------------|-------|
| Apps Script | No | Best match for “use my Gmail” on Railway |
| Brevo API | No | Verify one sender email in Brevo dashboard |
| Resend | Yes (for other people) | Without domain, only mails your own inbox |
| Nodemailer SMTP | N/A | Works locally only |
