# Painel Uber Analytics

Este projeto apresenta uma visualização interativa dos dados de corridas da Uber em Nova York, usando React, Vite, Plotly e PapaParse.


## 3. Visualizações
Todas as visualizações usam o utilitário `loadCsv` (`src/utils/csvLoader`) para ler os arquivos em `/data/*.csv`.
### 3.1. Mapa de calor temporal – dia × hora
Pergunta:
- Em quais dias e horários a demanda é mais intensa?
- CSV usado: UberDatasetCleaned.csv
   - Colunas usadas: day, start_hour


Componente: `src/components/HeatmapTemporal.jsx` :contentReference[oaicite:1]{index=1}  

- Lê `UberDatasetCleaned.csv`.
- Cria uma matriz 7×24 (`[dia da semana][hora]`) com contagem de corridas.
- Converte o nome do dia (`Sunday`, `Monday`, …) para índice via `dayMap`.
- Plota um heatmap Plotly com:
  - eixo X: horas do dia (`0:00` … `23:00`);
  - eixo Y: dias da semana (`Dom` … `Sáb`);
  - escala de cores `YlOrRd` (amarelo → vermelho);
  - `xgap` e `ygap` para dar separação visual entre células.
- Mostra tooltip com dia, hora e número de corridas.

<img width="1875" height="873" alt="Captura de tela 2025-12-02 053655" src="https://github.com/user-attachments/assets/7021f446-f514-46e6-9517-8c3f349c0d76" />

### 3.2. Mapa de bolhas – pickups por região e mês
Pergunta:
- Onde há maior concentração de pickups ao longo dos meses?
- CSV usado:
  
  - uber-raw-data-apr14.csv

  - uber-raw-data-may14.csv
  
  - uber-raw-data-jun14.csv
  
  - uber-raw-data-jul14.csv
  
  - uber-raw-data-aug14.csv
  
  - uber-raw-data-sep14.csv

    - Colunas usadas: Lat, Lon
      
  GeoJSON para contornos dos bairros:

  - nyc-zip-code-tabulation-areas-polygons.geojson

Componente: `src/components/MapScatter.jsx` :contentReference[oaicite:0]{index=0}  

- Lê um dos arquivos mensais de pickups, de acordo com o mês selecionado em um `<select>`.
- Para evitar travamentos, limita as linhas a `MAX_ROWS` (200.000); se houver mais linhas, faz um *downsampling* por passo.
- Agrega os pontos em uma grade (`GRID_SIZE = 0.01` graus) e conta quantos pickups caem em cada célula.
- Plota:
  - **bolhas** (scattergeo) dimensionadas pela quantidade de pickups;
  - **polígonos de ZIP codes** coloridos por borough com preenchimento sem borda;
  - **labels de boroughs** (Manhattan, Brooklyn, Queens, Bronx, Staten Island);
  - **legenda de boroughs** com traces “fantasmas” apenas para aparecerem na legenda.
- Limites do mapa focados em NYC (lon/lat fixos), projeção Mercator.

<img width="1616" height="886" alt="Captura de tela 2025-12-02 053705" src="https://github.com/user-attachments/assets/b6920759-9af8-46bb-a89c-ce531cb78a41" />

### 3.3. Histograma de duração das corridas
Pergunta:
- Como se distribuem as durações das corridas?
- CSV usado: UberDatasetCleaned.csv
  - Colunas usadas: duration



Componente: `src/components/DurationHistogram.jsx` :contentReference[oaicite:2]{index=2}  

- Lê `UberDatasetCleaned.csv` e extrai a coluna `duration`.
- Filtra valores não numéricos.
- Calcula o **95º percentil** da duração e descarta valores acima disso, para evitar cauda longa distorcendo o gráfico.
- Com os valores filtrados:
  - calcula média e desvio padrão;
  - gera uma curva de densidade normal (100 pontos) e escala a curva para ficar na mesma ordem de grandeza das barras (multiplica pela contagem e largura de bin).
- Plota:
  - **histograma** de duração com barras estilizadas;
  - **curva normal ajustada** por cima do histograma;
  - título explicativo mostrando o valor aproximado do 95º percentil.
<img width="1873" height="891" alt="Captura de tela 2025-12-02 053620" src="https://github.com/user-attachments/assets/05e38853-ae59-4a30-a866-40e0d895ad3d" />

---

## 4. Como executar o projeto

Pressupõe:

- Node.js LTS instalado
- Gerenciador de pacotes `npm` ou `yarn`


📦 Principais Dependências
Listadas em package.json 

package:
- react
- react-plotly.js
- plotly.js-dist-min
- papaparse
- vite


Passos típicos:

```bash
# instalar dependências
npm install

# ambiente de desenvolvimento (Vite ou CRA, conforme o projeto)
npm run dev      # ou: npm start

# build de produção
npm run build
