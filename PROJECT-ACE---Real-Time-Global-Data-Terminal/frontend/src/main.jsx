import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

/** Vite/React entry point — mounts the App into #root. */
createRoot(document.getElementById("root")).render(<App />);
