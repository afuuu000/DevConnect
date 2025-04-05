import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

console.log("✅ React is starting...");

const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error("❌ Root element not found!");
} else {
  console.log("✅ Root element found, mounting React...");
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
