# Client intake form: setup (about 10 minutes, no coding)

The form lives at `intake.html`. Once the site is published, the link is
`https://<your-username>.github.io/<repo-name>/intake.html`. Send that link to clients after they pay.

Out of the box the form shows a thank-you message but sends nothing. You need to connect it to a free
service that emails you each submission. Formspree is the simplest option.

## Option A: Formspree (recommended)

Free plan: 50 submissions a month. Each one arrives in your email and in a dashboard you can export.

1. Go to **formspree.io** and sign up with your email.
2. Click **New Form**. Name it "Astro Soulprint Intake" and set the email to the one where you want submissions.
3. Formspree shows a form URL like `https://formspree.io/f/abcdwxyz`. Copy it.
4. Open `intake.js` on GitHub and click the pencil icon to edit. Near the top, replace
   `https://formspree.io/f/YOUR_FORM_ID` with your URL. Keep the quote marks.
5. Click **Commit changes**. Wait about a minute for GitHub Pages to update.
6. Open your `intake.html` link and submit a test entry. Check your email. The first time, Formspree sends a
   confirmation email you need to click.
7. In the Formspree dashboard, open your form's **Settings** and add your site's domain
   (`<your-username>.github.io`) under allowed domains, so other websites can't use your form.

Each email lists every answer on its own line (Full name, Package, Birth time, and so on).

## Option B: Google Sheets (every client becomes a row)

Better if you want all clients in one spreadsheet. It's free but has a few more steps.

1. Create a Google Sheet. In row 1, type these headers, one per column, exactly:
   `Timestamp, Full name, Facebook name, Package, Date of birth, Birth time, Birth time note, Birth city, Birth country, Main question, Life area focus, Delivery format`
2. Click **Extensions → Apps Script**. Delete anything there and paste:

```js
function doPost(e) {
  var d = JSON.parse(e.postData.contents);
  SpreadsheetApp.getActiveSheet().appendRow([
    new Date(), d["Full name"], d["Facebook name"], d["Package"], d["Date of birth"],
    d["Birth time"], d["Birth time note"], d["Birth city"], d["Birth country"],
    d["Main question"], d["Life area focus"], d["Delivery format"]
  ]);
  return ContentService.createTextOutput("ok");
}
```

3. Click **Deploy → New deployment → Web app**. Set *Execute as*: **Me** and *Who has access*: **Anyone**.
   Click Deploy and approve the permissions. Copy the **Web app URL**.
4. In `intake.js`, set `formEndpoint` to that URL.
5. Change the two fetch headers in `intake.js` so Google accepts the request. Replace the `headers: {...}` line with
   `headers: { "Content-Type": "text/plain;charset=utf-8" },`. (The data is still sent as JSON text.)

If anything goes wrong in Option B, use Option A. It is much harder to break.

## Things you can change

All in `intake.js` (top of the file) or `intake.html`:

| What | Where |
|------|-------|
| Delivery times on the thank-you message | `deliveryDefault` (3 days), `deliveryLonger` (5 to 7 days) and `longerPackages` (full charts, Transit readings, Progressed Chart and the bundles) in `intake.js`. |
| Reading packages in the dropdown | The `<select id="package">` block in `intake.html`. It matches your current menu; add or remove `<option>` lines. |
| Colours | The `:root` block at the top of `intake.css` |

## Privacy note

The form collects birth details and personal questions. Formspree stores them on their servers, so only share
the dashboard login with yourself. Delete old submissions from Formspree after you've delivered each reading.
