import express from "express";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { querySchema } from "../shared/contracts.js";
import { getBrief, listFields } from "./domain.js";
export function createFieldRouter() {
  const app = express.Router();
  const sessions = new Map<string, string>();
  app.use((_req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    next();
  });
  app.post("/api/demo/session", (req, res) => {
    const origin = req.get("origin");
    if (
      origin &&
      !/^http:\/\/(localhost|127\.0\.0\.1):(5173|8787)$/.test(origin)
    ) {
      res.status(403).json({ error: "ORIGIN_DENIED" });
      return;
    }
    const parsed = z
      .object({ tenant: z.enum(["alpha", "beta"]) })
      .safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "INVALID_TENANT" });
      return;
    }
    const token = randomBytes(24).toString("hex");
    sessions.set(token, parsed.data.tenant);
    res.setHeader(
      "Set-Cookie",
      `agarena_demo=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=3600`,
    );
    res.json({ tenant: parsed.data.tenant, synthetic: true });
  });
  app.use("/api/fields", (req, res, next) => {
    const token = req.headers.cookie
      ?.split(";")
      .map((x) => x.trim())
      .find((x) => x.startsWith("agarena_demo="))
      ?.slice(13);
    const tenant = token ? sessions.get(token) : undefined;
    if (!tenant) {
      res.status(401).json({ error: "DEMO_SESSION_REQUIRED" });
      return;
    }
    res.locals.tenant = tenant;
    next();
  });
  app.get("/api/fields", (_req, res) => {
    res.json(listFields(res.locals.tenant));
  });
  app.get("/api/fields/:id/brief", (req, res) => {
    const q = querySchema.safeParse(req.query);
    if (!q.success) {
      res.status(400).json({ error: "INVALID_QUERY" });
      return;
    }
    const brief = getBrief(
      res.locals.tenant,
      String(req.params.id),
      q.data.asOf,
      q.data.scenario,
    );
    if (!brief) {
      res.status(404).json({ error: "NOT_FOUND" });
      return;
    }
    res.json(brief);
  });
  app.use("/api/fields", (_req, res) => {
    res.status(404).json({ error: "NOT_FOUND" });
  });
  return app;
}
