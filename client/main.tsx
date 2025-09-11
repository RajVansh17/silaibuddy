import React from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId="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">
    <App />
  </GoogleOAuthProvider>
);