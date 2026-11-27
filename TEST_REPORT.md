# BrightLoop AI — Test Report & Known Limitations

## Automated Checks Executed
- `npx tsc --noEmit`: Passed (0 errors)
- `npm run build`: Passed (0 errors, Next.js 16.4.6 Turbopack)
- Resend API Domain & Webhook Verification: Passed (`dipakpatel.site` verified)

## Known Limitations
- Razorpay payment links fall back to UPI deep-links (`upi://pay?...&cu=INR`) until `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are added to Vercel.
- DNS MX verification confirms domain mail routing, not individual mailbox existence.
