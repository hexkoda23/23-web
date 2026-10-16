# Twenty3 Growth Room

Open `/admin/growth` (or My Account → Store owner) to use the workspace.
The sample preview contains illustrative events only. It never writes data,
calls SerpAPI, confirms payments, publishes campaigns, or sends messages.

## Activate securely

1. Sign in with `kehindeadeleke92@gmail.com`. Verify the email through the admin
   access screen, then choose **Refresh access**. The server verifies a Firebase
   ID token on every request, including revocation. It allows this verified email,
   a UID in `GROWTH_ADMIN_UIDS`, or a trusted `admin: true` custom claim. A writable
   user-profile field does not grant access. `GROWTH_ADMIN_EMAILS` overrides the
   default email list. Comma-separate additional verified owner emails.
2. Review and deploy the Firestore access rules described below. No production
   rules were available locally, so do not replace existing rules wholesale.
3. Add `FIREBASE_SERVICE_ACCOUNT` (Firebase service-account JSON), `SITE_URL`
   (`https://shopfrom23.com`, the exact public origin without a trailing path), and a long random
   `CRON_SECRET` to Vercel's server environment. Add `SERPAPI_API_KEY` when ready
   for search. **Do not use VITE_ prefixes or paste keys into chat, URLs, or source.**
4. Set `GROWTH_STORAGE_READY=true` only after the rules are deployed and tested.
   Until then all growth database operations fail closed. `.env.example` contains
   names and safe defaults; `.env.local` is ignored by Git for local use.
5. Redeploy. Verify the owner can load the workspace and a normal customer receives
   403 from `/api/growth`. Check the Connections page. Before research, check your
   SerpAPI credits and set the focus and planning budget (default ₦0).
6. Enable **Daily opportunity research**. Vercel invokes `/api/growth-cron` daily
   at 09:00 UTC / 10:00 Nigeria time, with `Authorization: Bearer CRON_SECRET`.
   Hobby execution can fall within that hour. The job stays paused until enabled.

## Firestore rules — required before activation

All collections beginning `_growth_` are server-only. The frontend uses the
authenticated server API, not Firestore directly. Add an explicit exclusion to
**every broad allow rule** that could match these collections. Firestore matching
rules are ORed: a `false` rule cannot override a broad `true` rule.

For example, narrow an existing wildcard match by requiring
`!collection.matches('_growth_.*')` in its allow condition, while preserving the
existing per-collection restrictions for user profiles, messages, and orders.
Then add:

```text
match /{collection}/{document} {
  allow read, write: if false; // implicit default; no client growth access
}
```

This example is not a full rules file and must not be pasted as a replacement.
The required outcome is **no web/mobile client can read or write any `_growth_`
collection, including the owner**. Firebase Admin accesses these through IAM.
Audit `orders` separately: clients should create only their own pending orders,
read only their own orders, and never grant themselves a paid state. The new
dashboard ignores client-supplied paid states: only `_growth_order_reviews`
records written through the owner API count as confirmed payments.

Test anonymous and ordinary signed-in reads/writes against `_growth_events`,
`_growth_order_reviews`, `_growth_order_audit`, `_growth_settings`,
`_growth_opportunities`, `_growth_campaigns`, `_growth_runs`,
`_growth_research_usage`, and `_growth_limits`; all must fail. Test existing
shopping/profile flows still work. These live rule checks require your Firebase
project credentials; they were not performed by this local implementation.

## Data, retention, and limits

- Analytics are opt-in, respect Global Privacy Control, and exclude private page
  paths. No form text, passwords, message text, cursor recordings, raw IPs, or
  screen recordings are stored. Account records remain operational data and are
  shown only to an authorized owner through Firebase Admin.
- Events are anonymous sessions, not uniquely identified people. A session rotates
  after 30 minutes idle. Campaign tags should never contain emails or personal data.
  Scroll milestones and active page time describe movement without session replay.
- Public analytics are client-reported and can be incomplete or spoofed. The
  endpoint validates fields, rejects private paths, checks the request origin,
  caps batches at 20, requires a verified token for login/signup events, and applies
  shared Firestore rate limits. It never accepts client events as paid purchases.
- Event expiry: 90 days. Rate-limit records: 1 day. Research usage records: 90 days.
  Enable Firestore TTL on `expiresAt` for `_growth_events`, `_growth_limits`, and
  `_growth_research_usage`. The daily cron also deletes up to 400 expired records
  per collection as a fallback, even while research is paused. TTL is necessary
  to keep large backlogs within the intended retention window.
- Research returns at most 10 public organic search results per run. No contact
  scraping or automatic outreach occurs. Results are unverified opportunities.
  URLs are deduplicated; shortlist/status/notes survive repeated searches.
- `RESEARCH_DAILY_LIMIT` defaults to 2 and is capped at 5. Both manual and daily
  runs reserve a shared daily quota before calling SerpAPI; failed calls count.
  A retried cron invocation will not reserve a second scheduled query that day.
  Research settings do not authorize ad spend, contact messages, or publications.
- Dashboard windows are 7/30/90 days. Reads are bounded to 5,000 latest events,
  300 latest orders in the period, 100 opportunities, 40 campaigns, 10 research
  runs, and the first 1,000 Firebase accounts. Truncated reports are labelled.
  Account totals are all-time loaded accounts, not the selected analytics period.
- Revenue is the amount manually confirmed received for orders **created during
  the selected window**, excluding cancelled/refunded reviews. It is not a bank
  feed, profit figure, or payment-date cash-flow report. Receipt review writes a
  separate audit entry. Pending orders and WhatsApp clicks are never paid sales.
- No historical analytics are backfilled. Existing Firebase accounts and dated
  orders can be displayed. Session attribution does not establish causation or
  prove a campaign created a sale.
- API credentials are needed to check real data, payment-review persistence,
  SerpAPI results, and deployed scheduling. Until configured, the interface shows
  a truthful setup state and an explicitly labelled sample preview.

## Local preview and validation

`npm run dev` serves the app and the growth API at port 3122 using the same
handlers as production. Restart after changing `.env.local` values. Use
`npm run test:growth` for privacy, funnel, access-control and quota tests, and
`npm run build` for the production build. Existing unrelated lint failures remain
outside this feature's scope.

Useful first experiment: promote one available product with one campaign link,
post a real fit/size video, and review the next week's product views, bag actions,
pending orders and verified payments. Change one thing at a time. More searches
or more impressions do not guarantee sales.

Implementation references: [Firebase token verification](https://firebase.google.com/docs/auth/admin/verify-id-tokens),
[SerpAPI search](https://serpapi.com/search-api), and
[Vercel cron security](https://vercel.com/docs/cron-jobs/manage-cron-jobs).
