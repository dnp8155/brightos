import { SystemEvent } from '../types/agents';
import { createAdminClient } from '@/lib/supabase/server';

export class EventBusService {
  private static inMemoryEvents: SystemEvent[] = [];

  /**
   * Publishes a durable event with idempotency protection
   */
  public static async publish(
    eventType: string,
    idempotencyKey: string,
    payload: Record<string, any>
  ): Promise<{ success: boolean; event: SystemEvent; duplicate: boolean }> {
    const supabase = createAdminClient();

    // Check in-memory for fast idempotency lookup
    const existing = this.inMemoryEvents.find(e => e.idempotencyKey === idempotencyKey);
    if (existing) {
      return { success: true, event: existing, duplicate: true };
    }

    const event: SystemEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      eventType,
      idempotencyKey,
      payload,
      status: 'pending',
      attempts: 0,
      createdAt: new Date().toISOString()
    };

    this.inMemoryEvents.unshift(event);
    if (this.inMemoryEvents.length > 200) this.inMemoryEvents.pop();

    if (supabase) {
      try {
        const { data, error } = await (supabase.from('system_events') as any).insert({
          event_type: eventType,
          idempotency_key: idempotencyKey,
          payload,
          status: 'pending'
        }).select().single();

        if (error && error.code === '23505') { // Unique constraint violation
          return { success: true, event, duplicate: true };
        }
        if (data) {
          event.id = data.id;
        }
      } catch (err: any) {
        if (err.message?.includes('duplicate key') || err.code === '23505') {
          return { success: true, event, duplicate: true };
        }
      }
    }

    return { success: true, event, duplicate: false };
  }

  /**
   * Retrieves recent system events
   */
  public static async getRecentEvents(limit: number = 50): Promise<SystemEvent[]> {
    const supabase = createAdminClient();
    if (!supabase) return this.inMemoryEvents.slice(0, limit);

    try {
      const { data, error } = await supabase
        .from('system_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error || !data || data.length === 0) {
        return this.inMemoryEvents.slice(0, limit);
      }

      return data.map((d: any) => ({
        id: d.id,
        eventType: d.event_type,
        idempotencyKey: d.idempotency_key,
        payload: d.payload,
        status: d.status,
        attempts: d.attempts,
        processedAt: d.processed_at,
        errorMessage: d.error_message,
        createdAt: d.created_at
      }));
    } catch {
      return this.inMemoryEvents.slice(0, limit);
    }
  }
}
