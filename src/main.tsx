import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./main.scss";
import "react-toastify/dist/ReactToastify.css";
import { CookiesProvider } from "react-cookie";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <CookiesProvider>
      <App />
    </CookiesProvider>
  </React.StrictMode>,
);
