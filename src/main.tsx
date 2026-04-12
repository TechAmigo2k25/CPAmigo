import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { GlobalStatsProvider  } from "./contexts/GlobalStatsContext";

createRoot(document.getElementById("root")!).render(
  <GlobalStatsProvider>
    <App />
  </GlobalStatsProvider>
);

