# Incident Response Runbook

---

## Severity 1: Unauthorized Campaign Outflow / Misconfiguration
**Trigger**: An outbound campaign sends unintended emails or fails recipient filters.

### Immediate Action (Within 60 Seconds):
1. **Trigger Emergency Stop**:
   - Go to the **AI Agent Control Center** (`/agents`).
   - Click the red **Emergency Stop** button.
   - Alternatively, execute:
   ```bash
   curl -X POST https://ai.brightlooptechnology.in/api/agents/controls \
     -H "Content-Type: application/json" \
     -d '{"emergencyStop": true, "emergencyStopReason": "Operator Emergency Stop"}'
   ```
2. **Revoke Gmail Token**:
   - Disconnect the affected Gmail account in `/integrations` to immediately invalidate all OAuth sending rights.
3. **Drain BullMQ Outbound Queue**:
   - Clear waiting jobs in `brightloop-email-outbound`.

---

## Severity 2: OpenAI API Exhaustion or Outage
- System automatically switches to the rule-based fallback analyzer without failing campaign or CRM pipelines.
