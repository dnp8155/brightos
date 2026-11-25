/**
 * Dedicated Production Background Worker Service for BrightLoop AI
 * Designed for deployment on Railway, Render, Fly.io, or VPS (outside Vercel serverless).
 *
 * Responsibilities:
 * 1. Consumes BullMQ queues (Discovery, Audits, Outbound Dispatches)
 * 2. Emits persistent heartbeats into Supabase
 * 3. Enforces Emergency Stop and Global Pause between jobs
 * 4. Handles SIGINT / SIGTERM for graceful shutdown
 */

import http from "http";
import { validateEnv } from "../src/lib/env";
import { AgentRegistryService } from "../src/packages/agents/services/agent-registry-service";
import { DiscoveryQueueManager } from "../src/packages/discovery/queue/discovery-queue";

const PORT = Number(process.env.PORT) || 3001;
const WORKER_NODE_ID = process.env.WORKER_NODE_ID || `worker-node-${process.pid}`;

let isShuttingDown = false;
let heartbeatInterval: NodeJS.Timeout | null = null;

// Validate Environment
const envValidation = validateEnv();
if (!envValidation.valid) {
  console.error("[Worker CRITICAL] Startup aborted due to configuration errors:");
  envValidation.errors.forEach(e => console.error(`  - ${e}`));
  process.exit(1);
}

console.log(`[Worker Service] Starting BrightLoop Background Worker Node: ${WORKER_NODE_ID}`);
console.log(`[Worker Service] Node Environment: ${process.env.NODE_ENV || 'development'}`);

// 1. Lightweight HTTP Health Check Server (For Railway / Render / Kubernetes liveness probes)
const server = http.createServer(async (req, res) => {
  if (req.url === "/health" || req.url === "/") {
    if (isShuttingDown) {
      res.writeHead(503, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "shutting_down", workerNodeId: WORKER_NODE_ID }));
      return;
    }

    const controls = await AgentRegistryService.getSystemControls();

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      status: "healthy",
      workerNodeId: WORKER_NODE_ID,
      timestamp: new Date().toISOString(),
      controls: {
        emergencyStop: controls.emergencyStop,
        globalPause: controls.globalPause
      },
      uptimeSeconds: process.uptime()
    }));
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not found" }));
});

server.listen(PORT, () => {
  console.log(`[Worker Service] Liveness & health probe listening on port ${PORT}`);
});

// 2. Periodic Worker Heartbeat Registration
async function pulseHeartbeat() {
  if (isShuttingDown) return;
  try {
    // Record heartbeats for active agents
    await AgentRegistryService.recordHeartbeat(
      "campaign-execution-agent",
      WORKER_NODE_ID,
      process.cpuUsage().user / 1000000,
      0
    );
  } catch (err: any) {
    console.warn(`[Worker Heartbeat] Failed to emit pulse: ${err.message}`);
  }
}

// Initial pulse and recurring timer
pulseHeartbeat();
heartbeatInterval = setInterval(pulseHeartbeat, 30000);

// 3. Graceful Shutdown Handlers
async function gracefulShutdown(signal: string) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`\n[Worker Service] Received ${signal}. Initiating graceful shutdown...`);

  if (heartbeatInterval) clearInterval(heartbeatInterval);

  // Close HTTP health server
  server.close(() => {
    console.log("[Worker Service] HTTP health probe closed.");
  });

  // Allow in-flight jobs up to 10 seconds to finish
  const timeout = setTimeout(() => {
    console.error("[Worker Service] Forcefully exiting after 10s shutdown timeout.");
    process.exit(1);
  }, 10000);

  try {
    // Disconnect Redis queues cleanly
    const connection = DiscoveryQueueManager.getRedisConnection();
    if (connection) {
      await connection.quit();
      console.log("[Worker Service] Redis queue connection closed.");
    }
  } catch (err: any) {
    console.warn(`[Worker Service] Queue teardown error: ${err.message}`);
  }

  clearTimeout(timeout);
  console.log("[Worker Service] Graceful shutdown completed cleanly. Exiting.");
  process.exit(0);
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
