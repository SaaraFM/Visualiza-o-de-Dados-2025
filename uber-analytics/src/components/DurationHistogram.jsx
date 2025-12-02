// src/components/DurationHistogram.jsx
import { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import { loadCsv } from "../utils/csvLoader";

const DURATION_COL = "duration"; // coluna do UberDatasetCleaned.csv
const NBINS = 12;                // nº de barras do histograma

export default function DurationHistogram() {
  const [filteredValues, setFilteredValues] = useState([]);
  const [p95, setP95] = useState(null);
  const [lineX, setLineX] = useState([]);
  const [lineY, setLineY] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const rows = await loadCsv("/data/UberDatasetCleaned.csv");

        const nums = [];
        rows.forEach((row) => {
          const v = parseFloat(row[DURATION_COL]);
          if (!isNaN(v)) nums.push(v);
        });

        if (nums.length === 0) {
          setFilteredValues([]);
          return;
        }

        // ---- 1) corta no 95º percentil para melhorar visualização ----
        const sorted = [...nums].sort((a, b) => a - b);
        const idx = Math.floor(sorted.length * 0.95);
        const p95Value = sorted[idx];
        const filtered = nums.filter((v) => v <= p95Value);

        setFilteredValues(filtered);
        setP95(p95Value);

        // ---- 2) calcula curva normal ajustada (média e desvio padrão) ----
        const n = filtered.length;
        const minVal = Math.min(...filtered);
        const maxVal = Math.max(...filtered);

        const mean =
          filtered.reduce((acc, v) => acc + v, 0) / (n || 1);

        const variance =
          filtered.reduce((acc, v) => acc + (v - mean) ** 2, 0) /
          (n || 1);

        const std = Math.sqrt(variance || 1e-6);

        const binWidth = (maxVal - minVal) / (NBINS || 1) || 1;

        const xCurve = [];
        const yCurve = [];
        const STEPS = 100;

        for (let i = 0; i <= STEPS; i++) {
          const x =
            minVal + ((maxVal - minVal) * i) / STEPS;

          const pdf =
            (1 / (std * Math.sqrt(2 * Math.PI))) *
            Math.exp(-0.5 * ((x - mean) / std) ** 2);

          // escala a densidade para ficar na mesma ordem de grandeza das barras
          const y = pdf * n * binWidth;

          xCurve.push(x);
          yCurve.push(y);
        }

        setLineX(xCurve);
        setLineY(yCurve);
      } catch (err) {
        console.error("Erro ao carregar CSV do histograma:", err);
      }
    }

    fetchData();
  }, []);

  if (!filteredValues.length) return <p>Carregando histograma...</p>;

  return (
    <Plot
      data={[
        // 1) barras do histograma
        {
          type: "histogram",
          x: filteredValues,
          nbinsx: 20,
          marker: {
            color: "rgba(55, 140, 200, 0.8)",
            line: {
              width: 2,       // separação visual entre barras
              color: "#ffffff",
            },
          },
          name: "Duração das corridas",
          hovertemplate:
            "Duração: %{x:.1f} min<br>Nº de corridas: %{y}<extra></extra>",
        },
        // 2) curva normal ajustada
        {
          type: "scatter",
          mode: "lines",
          x: lineX,
          y: lineY,
          name: "Curva normal ajustada",
          line: {
            color: "darkblue",
            width: 2,
          },
          hovertemplate:
            "Curva normal<br>Duração: %{x:.1f} min<br>Frequência estimada: %{y:.1f}<extra></extra>",
        },
      ]}
      layout={{
        title: {
          text:
            "Histograma da Duração das Corridas<br>" +
            "<span style='font-size:13px'>Duração típica das corridas — exibindo até o 95º percentil (" +
            (p95 ? `~${p95.toFixed(1)} min` : "?") +
            ") e curva normal ajustada</span>",
          x: 0.5,
          xanchor: "center",
        },
        xaxis: {
          title: { text: "Duração das corridas (minutos)" },
        },
        yaxis: {
          title: { text: "Número de corridas no intervalo" },
        },
        showlegend: true,
        legend: {
          orientation: "h",
          x: 0.5,
          xanchor: "center",
          y: -0.15,
        },
        margin: { l: 80, r: 40, t: 90, b: 90 },
        autosize: true,
      }}
      useResizeHandler
      style={{ width: "100%", height: "100%" }}
    />
  );
}
