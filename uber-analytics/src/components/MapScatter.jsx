// src/components/MapScatter.jsx
import { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import { loadCsv } from "../utils/csvLoader";

// Arquivos por mês (Uber-Jan-Feb-FOIL NÃO entra aqui, só os raw)
const FILES = [
  { name: "uber-raw-data-apr14.csv", label: "Abril de 2014" },
  { name: "uber-raw-data-may14.csv", label: "Maio de 2014" },
  { name: "uber-raw-data-jun14.csv", label: "Junho de 2014" },
  { name: "uber-raw-data-jul14.csv", label: "Julho de 2014" },
  { name: "uber-raw-data-aug14.csv", label: "Agosto de 2014" },
  { name: "uber-raw-data-sep14.csv", label: "Setembro de 2014" },
];

const LAT_COL = "Lat";
const LON_COL = "Lon";

// limite de linhas lidas (pra não travar)
const MAX_ROWS = 200000;

// tamanho da célula de agregação (quanto menor, mais “orgânico”)
const GRID_SIZE = 0.01;

// posições aproximadas dos boroughs para mostrar os nomes no mapa
const BOROUGH_LABELS = [
  { name: "Manhattan", lat: 40.7831, lon: -73.9712 },
  { name: "Brooklyn", lat: 40.65, lon: -73.9496 },
  { name: "Queens", lat: 40.7282, lon: -73.7949 },
  { name: "Bronx", lat: 40.8448, lon: -73.8648 },
  { name: "Staten Island", lat: 40.5795, lon: -74.1502 },
];

// Cada borough com uma cor de preenchimento
const BOROUGH_COLORS = {
  Manhattan: "rgba(54, 162, 235, 0.25)", // azul
  Brooklyn: "rgba(255, 99, 71, 0.25)", // vermelho
  Queens: "rgba(255, 206, 86, 0.25)", // amarelo
  Bronx: "rgba(75, 192, 192, 0.25)", // verde água
  "Staten Island": "rgba(153, 102, 255, 0.25)", // roxo
};

export default function MapScatter() {
  const [selectedMonth, setSelectedMonth] = useState(FILES[0].label);
  const [points, setPoints] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  // vai guardar os polígonos já com o nome do borough e a cor
  const [zipShapes, setZipShapes] = useState([]);

  // Carrega e agrega os CSVs de pickups
  useEffect(() => {
    async function fetchAndAggregate() {
      try {
        setIsLoading(true);
        setPoints([]);

        const file = FILES.find((f) => f.label === selectedMonth);
        if (!file) return;

        const data = await loadCsv(`/data/${file.name}`);

        let rows = data;
        if (data.length > MAX_ROWS) {
          const step = Math.ceil(data.length / MAX_ROWS);
          rows = data.filter((_, idx) => idx % step === 0);
        }

        const gridMap = new Map();

        rows.forEach((row) => {
          const latVal = parseFloat(row[LAT_COL]);
          const lonVal = parseFloat(row[LON_COL]);
          if (isNaN(latVal) || isNaN(lonVal)) return;

          const latBin = Math.round(latVal / GRID_SIZE) * GRID_SIZE;
          const lonBin = Math.round(lonVal / GRID_SIZE) * GRID_SIZE;
          const key = `${latBin},${lonBin}`;

          if (!gridMap.has(key)) {
            gridMap.set(key, {
              lat: latBin,
              lon: lonBin,
              count: 0,
            });
          }
          const cell = gridMap.get(key);
          cell.count += 1;
        });

        setPoints(Array.from(gridMap.values()));
      } catch (err) {
        console.error("Erro ao carregar/agregar dados de NYC:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAndAggregate();
  }, [selectedMonth]);

  // Carrega o GeoJSON de ZIP codes e define cor por borough
  useEffect(() => {
    async function fetchGeo() {
      try {
        const res = await fetch(
          "/data/nyc-zip-code-tabulation-areas-polygons.geojson"
        );
        if (!res.ok) {
          console.warn(
            "Não foi possível carregar nyc-zip-code-tabulation-areas-polygons.geojson"
          );
          return;
        }

        const geo = await res.json();
        const shapes = [];

        if (geo.features && Array.isArray(geo.features)) {
          geo.features.forEach((feature) => {
            const geom = feature.geometry;
            if (!geom) return;

            const props = feature.properties || {};

            const borough =
              props.borough ||
              props.Borough ||
              props.BOROUGH ||
              props.boro_name ||
              props.BoroName ||
              props.COUNTY ||
              "Desconhecido";

            const fillcolor =
              BOROUGH_COLORS[borough] || "rgba(200,200,200,0.15)";

            if (geom.type === "Polygon") {
              geom.coordinates.forEach((ring) => {
                shapes.push({
                  borough,
                  lon: ring.map((c) => c[0]),
                  lat: ring.map((c) => c[1]),
                  fillcolor,
                });
              });
            } else if (geom.type === "MultiPolygon") {
              geom.coordinates.forEach((poly) => {
                poly.forEach((ring) => {
                  shapes.push({
                    borough,
                    lon: ring.map((c) => c[0]),
                    lat: ring.map((c) => c[1]),
                    fillcolor,
                  });
                });
              });
            }
          });
        }

        setZipShapes(shapes);
      } catch (err) {
        console.error("Erro ao carregar GeoJSON de ZIPs:", err);
      }
    }

    fetchGeo();
  }, []);

  const controls = (
    <div style={{ marginBottom: "0.5rem" }}>
      <label style={{ marginRight: "0.5rem" }}>Mês:</label>
      <select
        value={selectedMonth}
        onChange={(e) => setSelectedMonth(e.target.value)}
      >
        {FILES.map((f) => (
          <option key={f.name} value={f.label}>
            {f.label}
          </option>
        ))}
      </select>
      {points.length > 0 && (
        <span
          style={{
            marginLeft: "1rem",
            fontSize: "0.9rem",
            color: "#555",
          }}
        >
          Mostrando {points.length.toLocaleString("pt-BR")} regiões agregadas
        </span>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div style={{ height: "100%", padding: "0.5rem" }}>
        {controls}
        <p>Carregando pickups de NYC e gerando bolhas...</p>
      </div>
    );
  }

  if (!isLoading && points.length === 0) {
    return (
      <div style={{ height: "100%", padding: "0.5rem" }}>
        {controls}
        <p>Não há dados válidos para exibir.</p>
      </div>
    );
  }

  const lat = points.map((p) => p.lat);
  const lon = points.map((p) => p.lon);
  const counts = points.map((p) => p.count);
  const text = points.map(
    (p) => `Pickups na região: ${p.count.toLocaleString("pt-BR")}`
  );

  const maxCount = Math.max(...counts);
  const minCount = Math.min(...counts);

  const sizes = counts.map((c) => {
    if (maxCount === minCount) return 10;
    const norm = (c - minCount) / (maxCount - minCount);
    return 6 + norm * 22; // bolhas entre 6 e 28 px
  });

  // áreas coloridas por borough (sem linhas internas)
  const zipBorderTraces = zipShapes.map((shape, idx) => ({
    type: "scattergeo",
    mode: "lines",
    lon: shape.lon,
    lat: shape.lat,
    line: { width: 0 }, // sem contorno de cada ZIP
    fill: "toself",
    fillcolor: shape.fillcolor,
    hoverinfo: "skip",
    showlegend: false,
    name: shape.borough ?? `Área ${idx}`,
  }));

  // legenda dos boroughs — cada um vira um trace invisível só para aparecer na legenda
  const boroughLegendTraces = Object.entries(BOROUGH_COLORS).map(
    ([borough, color]) => ({
      type: "scattergeo",
      mode: "markers",
      lat: [999], // ponto invisível fora do mapa
      lon: [999],
      marker: {
        size: 12,
        color,
        line: { width: 0 },
      },
      name: borough,
      showlegend: true,
      hoverinfo: "skip",
    })
  );

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {controls}

      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Plot
          data={[
            // bolhas agregadas
            {
              type: "scattergeo",
              mode: "markers",
              lat,
              lon,
              text,
              marker: {
                size: sizes,
                color: counts,
                colorscale: "YlOrRd", // amarelo (menos) -> vermelho (mais)
                cmin: minCount,
                cmax: maxCount,
                reversescale: false,
                colorbar: {
                  title: "Nº de pickups",
                },
                opacity: 0.85,
                line: {
                  width: 0.4,
                  color: "rgba(0,0,0,0.4)",
                },
              },
              showlegend: false, // não aparece na legenda
            },
            // áreas por borough
            ...zipBorderTraces,
            // legenda dos boroughs (traces "fantasma")
            ...boroughLegendTraces,
            // labels dos boroughs (por cima de tudo)
            {
              type: "scattergeo",
              mode: "text",
              lat: BOROUGH_LABELS.map((b) => b.lat),
              lon: BOROUGH_LABELS.map((b) => b.lon),
              text: BOROUGH_LABELS.map((b) => b.name),
              textfont: {
                family: "Arial Black, sans-serif",
                size: 14,
                color: "#000000",
              },
              textposition: "middle center",
              showlegend: false,
              hoverinfo: "skip",
            },
          ]}
          layout={{
            title: {
              text: `Mapa de bolhas – concentração de pickups Uber em NYC (${selectedMonth}).
              <br>Áreas de Nova York com maior demanda por corridas.`,

              x: 0.5,
              xanchor: "center",
            },
            geo: {
              scope: "north america",
              projection: {
                type: "mercator",
                scale: 1,
              },
              center: { lon: -73.95, lat: 40.75 },
              lonaxis: { range: [-74.25, -73.65] },
              lataxis: { range: [40.55, 40.95] },
              showland: true,
              landcolor: "#ffffff",
              showlakes: true,
              lakecolor: "#e0f3ff",
              coastlinecolor: "#cccccc",
              subunitcolor: "#dddddd",
              subunitwidth: 0.5,
            },
            legend: {
              x: 1.13,
              y: 0.98,
              xanchor: "left",
              yanchor: "top",
              bgcolor: "rgba(255,255,255,0.8)",
              bordercolor: "#ccc",
              borderwidth: 1,
            },
            paper_bgcolor: "#ffffff",
            plot_bgcolor: "#ffffff",
            margin: { l: 20, r: 100, t: 70, b: 20 }, // mais espaço à direita pra colorbar
            autosize: true,
          }}
          useResizeHandler
          style={{ width: "100%", height: "100%", maxWidth: 900 }}
        />
      </div>
    </div>
  );
}
