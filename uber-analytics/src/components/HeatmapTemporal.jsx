// src/components/HeatmapTemporal.jsx
import { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import { loadCsv } from "../utils/csvLoader";

const dayLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

// mapeia strings do CSV → índice do dia
const dayMap = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

const hourLabels = Array.from({ length: 24 }, (_, i) => `${i}:00`);

export default function HeatmapTemporal() {
  const [zData, setZData] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const rows = await loadCsv("/data/UberDatasetCleaned.csv");

        // matriz 7 (dias) × 24 (horas)
        const matrix = Array.from({ length: 7 }, () =>
          Array.from({ length: 24 }, () => 0)
        );

        rows.forEach((row) => {
          const dayStr = row["day"];
          const hourStr = row["start_hour"];

          if (!dayStr || hourStr === undefined) return;

          const dayIndex = dayMap[dayStr];
          const hour = Number(hourStr);

          if (
            dayIndex === undefined ||
            isNaN(hour) ||
            hour < 0 ||
            hour > 23
          ) {
            return;
          }

          matrix[dayIndex][hour] += 1;
        });

        setZData(matrix);
      } catch (err) {
        console.error("Erro ao processar heatmap:", err);
      }
    }

    fetchData();
  }, []);

  if (!zData) return <p>Carregando heatmap temporal...</p>;

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Plot
        data={[
          {
            z: zData,
            x: hourLabels,
            y: dayLabels,
            type: "heatmap",
            colorscale: "YlOrRd", // amarelo (menos) -> vermelho (mais)
            hoverongaps: false,
              xgap: 2, 
              ygap: 2,
            colorbar: {
              title: "Quantidade de corridas",
            },
            hovertemplate:
              "Dia: %{y}<br>Hora: %{x}<br>Corridas: %{z}<extra></extra>",
          },
        ]}
        layout={{
          title: {
            text:
              "Mapa de calor temporal – volume de corridas por hora e dia da semana.<br>" +
              "Dias e horários há maior demanda por corridas.",
            x: 0.5,
            xanchor: "center",
          },
          xaxis: {
            title: "Hora do dia",
            tickpadding: 10, 
          },
          yaxis: {
            title: "Dia da semana",
            tickpadding: 10, 
          },
          margin: { l: 80, r: 40, t: 80, b: 60 },
          autosize: true,
        }}
        useResizeHandler
        style={{ width: "100%", height: "100%" }}
      />

      {/* mini-análise textual diretamente abaixo do gráfico */}
      <div
        style={{
          marginTop: "0.75rem",
          fontSize: "0.9rem",
          maxWidth: "900px",
          alignSelf: "center",
        }}
      >
      </div>
    </div>
  );
}
