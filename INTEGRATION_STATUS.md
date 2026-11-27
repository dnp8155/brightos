# BrightLoop AI — Integration Status

| Integration | Status | Notes |
| --- | --- | --- |
| Supabase | VERIFIED | Auth, `profiles`, `leads`, `email_events`, `inbox_messages` |
| Resend | VERIFIED | `dipakpatel.site` verified, webhook `864992f2-a268-4276-b731-92313869bcf8` active |
| Serper (Google Search & Places) | VERIFIED | Configured on Vercel for lead discovery & auto-discover cron |
| DNS MX Verifier | VERIFIED | Built-in `dns/promises` lookup |
| Razorpay | BLOCKED (Optional) | Uses instant UPI INR fallback until `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET` are set |
