# Known Limitations & External Dependencies

---

## 1. External API Dependencies (Not Code Bugs)
- **OpenAI API**: If no `OPENAI_API_KEY` is provided, the system falls back to rule-based and deterministic template synthesis rather than crashing.
- **Gmail API**: OAuth credentials must be generated in the Google Cloud Console with the `gmail.send` scope. Sending is disabled until an administrator authorizes their inbox.
- **Google Places**: Requires Google Maps billing enablement in Google Cloud Console. CSV import functions independently without requiring Google APIs.
- **Redis & BullMQ**: In local development, an in-memory job store handles queues. For persistent multi-server deployments, a Redis instance is required.

## 2. Headless Browser Crawling
- Running comprehensive Lighthouse audits consumes CPU and memory. Headless crawls should be executed on the standalone worker service rather than within short-lived serverless functions.
