# Email setup (no domain needed)

## Why Nodemailer alone fails on Railway

On your laptop, Nodemailer + Gmail App Password works.

On **Railway**, outbound SMTP ports **465/587 are blocked**, so the same
`EMAIL_USER` / `EMAIL_PASS` time out. That is a Railway network limit, not a bad password.

---

## Option A — Google Apps Script (uses your Gmail)

### 1) Create the script
1. Open https://script.google.com → **New project**
2. Paste this code:

```javascript
function doPost(e) {
  try {
    var raw = (e && e.postData && e.postData.contents) ? e.postData.contents : '{}';
    var data = JSON.parse(raw);
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
      name: 'DiaBuddy',
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

// Open the /exec URL in a browser — should show {"ok":true,"ping":true}
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, ping: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

3. **Project Settings** (gear) → **Script properties** → Add:
   - Property: `SECRET`
   - Value: any long random string (e.g. `diabuddy_mail_7f3a9c`)

4. **Deploy** → **New deployment** → type **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone** ← must be exactly this  
     (NOT "Anyone with a Google account" — that causes 401 from Railway)
5. Click **Authorize access** → your Google account → **Advanced** → Go to project (unsafe) → **Allow**
6. Copy the Web app URL ending in `/exec`

### Test in browser (important)
Paste the `/exec` URL in Chrome. You must see:

```json
{"ok":true,"ping":true}
```

If you see Google login, Drive error, or unauthorized HTML → access is still wrong.  
Edit deployment again: **Anyone** + **New version** + Authorize.

### Railway variables
```
GMAIL_SCRIPT_URL=https://script.google.com/macros/s/XXXX/exec
GMAIL_SCRIPT_SECRET=diabuddy_mail_7f3a9c
```

Then redeploy Railway.

---

## Option B — Brevo (easier if Apps Script keeps failing)

No domain. No Apps Script.

1. Sign up at https://www.brevo.com (free)
2. Verify your Gmail as sender (click email link)
3. Create an API key
4. Railway variables:
   ```
   BREVO_API_KEY=xkeysib-...
   EMAIL_USER=your_gmail@gmail.com
   ```
5. Clear `GMAIL_SCRIPT_URL` (or leave unused) and redeploy

---

## Local development (Nodemailer)

```env
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
```
