import { useState } from "react";
import HeatmapTemporal from "./components/HeatmapTemporal";
import MapScatter from "./components/MapScatter";
import DurationHistogram from "./components/DurationHistogram";

const TABS = {
  HEATMAP: "HEATMAP",
  MAP: "MAP",
  HISTOGRAM: "HISTOGRAM",
};

export default function App() {
  const [tab, setTab] = useState(TABS.HEATMAP);

  return (
    <div
      style={{
        fontFamily: "system-ui, sans-serif",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <header
        style={{
          padding: "0.75rem 1rem",
          borderBottom: "1px solid #ddd",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "1.25rem" }}>
          Uber Analytics – Visualização de Dados
        </h1>
      </header>

      <nav
        style={{
          padding: "0.5rem 1rem",
          borderBottom: "1px solid #eee",
          display: "flex",
          gap: "0.5rem",
        }}
      >
        <button
          onClick={() => setTab(TABS.HEATMAP)}
          style={{
            padding: "0.4rem 0.8rem",
            background: tab === TABS.HEATMAP ? "#222" : "#eee",
            color: tab === TABS.HEATMAP ? "#fff" : "#000",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Mapa de calor temporal (Corridas por hora e dia)
        </button>
        <button
          onClick={() => setTab(TABS.MAP)}
          style={{
            padding: "0.4rem 0.8rem",
            background: tab === TABS.MAP ? "#222" : "#eee",
            color: tab === TABS.MAP ? "#fff" : "#000",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Mapa de dispersão de Nova York
        </button>
        <button
          onClick={() => setTab(TABS.HISTOGRAM)}
          style={{
            padding: "0.4rem 0.8rem",
            background: tab === TABS.HISTOGRAM ? "#222" : "#eee",
            color: tab === TABS.HISTOGRAM ? "#fff" : "#000",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Histograma da Duração das Corridas
        </button>
      </nav>

      <main style={{ flex: 1, padding: "0.5rem 1rem" }}>
        <div style={{ width: "100%", height: "100%" }}>
          {tab === TABS.HEATMAP && <HeatmapTemporal />}
          {tab === TABS.MAP && <MapScatter />}
          {tab === TABS.HISTOGRAM && <DurationHistogram />}
        </div>
      </main>
    </div>
  );
}
