import { NextRequest, NextResponse } from "next/server";
import { EventBusService } from "@/packages/agents/services/event-bus-service";

export async function GET(req: NextRequest) {
  try {
    const limit = Number(req.nextUrl.searchParams.get("limit")) || 50;
    const events = await EventBusService.getRecentEvents(limit);
    return NextResponse.json({ success: true, events });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch event feed" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventType, idempotencyKey, payload } = body;

    if (!eventType || !idempotencyKey) {
      return NextResponse.json(
        { success: false, error: "eventType and idempotencyKey are required" },
        { status: 400 }
      );
    }

    const result = await EventBusService.publish(eventType, idempotencyKey, payload || {});
    return NextResponse.json({ ...result });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to publish event" },
      { status: 500 }
    );
  }
}
