import { createApp } from "./app.js";
if (process.env.AGARENA_DEMO !== "1")
  throw new Error(
    "This fixture server requires AGARENA_DEMO=1. It is not production authentication.",
  );
const server = createApp().listen(8787, "127.0.0.1", () =>
  console.log("AgArena synthetic API: http://127.0.0.1:8787"),
);
process.on("SIGTERM", () => server.close());
