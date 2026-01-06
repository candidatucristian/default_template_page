import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./App.css";
import "./i18n"; // <--- IMPORT I18N

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <React.Suspense
      fallback={<div className="p-10 text-white">Loading...</div>}
    >
      <App />
    </React.Suspense>
  </React.StrictMode>
);
