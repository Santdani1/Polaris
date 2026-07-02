/**
 * POLARIS worker — Fase 0: esqueleto BullMQ + Redis, sin jobs todavía.
 *
 * Expone un healthcheck HTTP (GET /health) y verifica la conexión a Redis
 * en segundo plano. No truena si Redis no está disponible: reporta el
 * estado y reintenta, para que `pnpm dev` levante sin fricción.
 */
import { createServer } from "node:http";
import { config } from "dotenv";
import { resolve } from "node:path";
import { Redis } from "ioredis";
import { QUEUE_NAMES } from "./queues.js";

config();
config({ path: resolve(import.meta.dirname, "../../../.env") });

const PORT = Number(process.env.WORKER_PORT ?? 8787);
const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";

let redisStatus: "connected" | "connecting" | "disconnected" = "connecting";

const redis = new Redis(REDIS_URL, {
  lazyConnect: true,
  maxRetriesPerRequest: null,
  retryStrategy: (times) => Math.min(times * 2_000, 15_000),
});

redis.on("ready", () => {
  redisStatus = "connected";
  console.log(`[worker] Redis conectado (${REDIS_URL})`);
});
redis.on("error", () => {
  if (redisStatus !== "disconnected") {
    redisStatus = "disconnected";
    console.warn(
      `[worker] Redis no disponible en ${REDIS_URL} — reintentando. Las colas de BullMQ se registran cuando conecte.`
    );
  }
});

redis.connect().catch(() => {
  // el retryStrategy se encarga; el healthcheck reporta "disconnected"
});

const server = createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(redisStatus === "connected" ? 200 : 503, {
      "content-type": "application/json",
    });
    res.end(
      JSON.stringify({
        service: "polaris-worker",
        phase: 0,
        redis: redisStatus,
        queues: Object.values(QUEUE_NAMES),
        jobs: "ninguno — los jobs llegan en Fase 2+ (cadencias, SENTINEL, STRATEGIST)",
      })
    );
    return;
  }
  res.writeHead(404, { "content-type": "application/json" });
  res.end(JSON.stringify({ error: "not found" }));
});

server.listen(PORT, () => {
  console.log(`[worker] Healthcheck en http://localhost:${PORT}/health`);
  console.log(`[worker] Colas registradas (sin jobs en Fase 0): ${Object.values(QUEUE_NAMES).join(", ")}`);
});

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    console.log(`[worker] ${signal} recibido, cerrando…`);
    server.close();
    void redis.quit().finally(() => process.exit(0));
  });
}
