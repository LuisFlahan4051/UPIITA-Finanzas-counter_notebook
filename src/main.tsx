import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AddMovementSection } from "./components/sections/AddMovementSection";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";

const getRootComponent = () => {
  try {
    return getCurrentWebviewWindow().label === "new_movement" ? (
      <AddMovementSection />
    ) : (
      <App />
    );
  } catch {
    // Fallback for non-Tauri browser contexts.
    return <App />;
  }
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>{getRootComponent()}</React.StrictMode>,
);
