# Email Authentication & Deliverability Guide

---

## 1. Domain Authentication Requirements

To ensure legitimate inbox delivery and protect domain reputation, configure the following DNS records for your sending domain (e.g., `brightlooptechnology.in`):

### SPF (Sender Policy Framework)
Add or update the TXT record on your root domain:
```text
v=spf1 include:_spf.google.com ~all
```

### DKIM (DomainKeys Identified Mail)
1. In the Google Workspace Admin console, generate a 2048-bit DKIM key for your sending domain.
2. Publish the resulting TXT record at:
```text
google._domainkey.brightlooptechnology.in
```

### DMARC (Domain-based Message Authentication)
Publish a DMARC policy record at `_dmarc.brightlooptechnology.in`:
```text
v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@brightlooptechnology.in; pct=100; sp=quarantine
```

---

## 2. Deliverability Best Practices
1. **Never Fabricate Open Rates**: BrightLoop AI uses verified reply threads and delivery webhooks rather than tracking pixels.
2. **Pacing & Warm-up**: Throttle new domains to <= 20 emails daily, scaling gradually over 30 days.
3. **Strict Suppression Enforcement**: The pre-flight validator rejects contacts present in the suppression list or who previously unsubscribed.
4. **Mandatory Unsubscribe Headers**: Every dispatch includes RFC 8058 `List-Unsubscribe` headers and direct opt-out links.
