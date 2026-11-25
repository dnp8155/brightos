# Rollback & Deployment Recovery Guide

---

## 1. Frontend Rollback (Vercel)
1. Go to **Vercel Dashboard > Project > Deployments**.
2. Locate the last known passing deployment.
3. Click the three dots `...` and select **Promote to Production**.
4. The DNS switch takes place instantaneously with zero downtime.

---

## 2. Database Migration Rollback Strategy
If a database migration causes errors, roll back using standard reverse SQL scripts:
- Revert table migrations in reverse numeric sequence (`009` -> `001`).
- Ensure no active background workers are running during schema modification.

---

## 3. Background Worker Rollback
1. In Railway or your container host, roll back the deployment image to the prior stable tag.
2. Verify worker liveness probe:
```bash
curl http://localhost:3001/health
```
3. Confirm worker heartbeat pulses are received in `/agents`.
