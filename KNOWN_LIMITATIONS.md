# BrightLoop AI — Known Limitations

1. **Razorpay Live Keys**: Currently uses instant UPI INR fallback when `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` are not configured.
2. **DNS MX Verification**: Confirms domain-level MX records; does not probe individual SMTP mailboxes.
3. **WhatsApp**: Uses 1-click `wa.me` click-to-chat; automated template messaging requires WhatsApp Business Platform API credentials.
