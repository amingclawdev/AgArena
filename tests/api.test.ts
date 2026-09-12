import { test } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../server/app.js";
import { Store } from "../server/store.ts";
test("HTTP boundary requires session and denies cross-tenant briefs", async () => {
  const store = new Store(":memory:");
  const server = createApp(store).listen(0, "127.0.0.1");
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw Error("No port");
  const base = `http://127.0.0.1:${address.port}/api`;
  try {
    assert.equal((await fetch(base + "/fields")).status, 401);
    const dashboard = await fetch(base + "/dashboard");
    assert.equal(dashboard.status, 200);
    assert.equal((await dashboard.json()).mode, "live");
    assert.equal(
      (
        await fetch(base + "/demo/session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Origin: "https://untrusted.example",
          },
          body: JSON.stringify({ tenant: "beta" }),
        })
      ).status,
      403,
    );
    const login = await fetch(base + "/demo/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tenant: "beta" }),
    });
    const cookie = login.headers.get("set-cookie")!.split(";")[0];
    const headers = { Cookie: cookie };
    const fields = await (await fetch(base + "/fields", { headers })).json();
    assert.deepEqual(
      fields.map((f: { id: string }) => f.id),
      ["birch"],
    );
    assert.equal(
      (await fetch(base + "/fields/north/brief", { headers })).status,
      404,
    );
    const b = await fetch(base + "/fields/birch/brief", { headers });
    assert.equal(b.status, 200);
    assert.equal(b.headers.get("cache-control"), "no-store");
    assert.equal(
      (await fetch(base + "/fields/birch/brief?asOf=garbage", { headers }))
        .status,
      400,
    );
    assert.equal(
      (
        await fetch(base + "/fields/birch/brief?scenario=unrecognized", {
          headers,
        })
      ).status,
      400,
    );
    assert.equal(
      (await fetch(base + "/fields/birch/export", { headers })).status,
      404,
    );
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close((e) => { store.close(); e ? reject(e) : resolve(); }),
    );
  }
});
