import { timingSafeEqual } from "node:crypto";
import { readEnv } from "./env.js";

export function isReminderWorkerAuthorized(request: Request) {
  const expected = readEnv("REMINDER_WORKER_SECRET");
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
  const expectedBytes = new TextEncoder().encode(expected);
  const suppliedBytes = new TextEncoder().encode(supplied);
  return expected.length >= 32
    && expectedBytes.length === suppliedBytes.length
    && timingSafeEqual(expectedBytes, suppliedBytes);
}
