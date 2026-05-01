import React from "react";
import ReactDOM from "react-dom/client";
import "mapbox-gl/dist/mapbox-gl.css";
import "./index.css";
import { MapPage } from "./pages/MapPage";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MapPage />
  </React.StrictMode>,
);
