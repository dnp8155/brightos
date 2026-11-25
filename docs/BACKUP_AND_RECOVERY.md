# Backup & Disaster Recovery Strategy

---

## 1. PostgreSQL Database Backups (Supabase)
- **Automated Daily Snapshots**: Supabase Pro/Enterprise projects capture daily automated backups retained for 7 to 30 days.
- **Point-In-Time Recovery (PITR)**: Provides restoration granularity down to the exact second.

---

## 2. Manual Backup Procedure
Admins can dump the current schema and data locally using the Supabase CLI:
```bash
npx supabase db dump -f brightloop_backup_$(date +%Y%m%d).sql --data-only
```

---

## 3. Disaster Recovery Runbook
1. **Database Corruption / Outage**:
   - Navigate to Supabase Dashboard > Database > Backups.
   - Select the target snapshot or point-in-time recovery target.
   - Trigger restoration into a staging replica to verify data integrity before promoting.
2. **Worker Teardown**:
   - The worker service runs on stateless containers. If a worker container crashes, Railway/Render spins up a new instance within seconds.
   - Persistent queue state is maintained safely in Redis.
