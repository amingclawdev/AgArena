import React from "react";
import { createRoot } from "react-dom/client";

async function mount() {
  const capture = window.location.pathname === "/capture";
  const { default: App } = await (capture ? import("./CaptureApp") : import("./App"));
  await (capture ? import("./styles.css") : import("./style.css"));
  createRoot(document.getElementById("root")!).render(
    <React.StrictMode><App /></React.StrictMode>,
  );
}
void mount();
