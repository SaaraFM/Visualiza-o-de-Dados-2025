**Uber Analytics — Visualização de dados (React + Vite)**

Visão geral

- **Descrição:** Aplicação React criada com Vite para explorar visualmente dados de corridas Uber (mapa de dispersão, histograma de duração e heatmap temporal).
- **Propósito:** Dashboard interativo para análise exploratória e visualização espacial/temporal do dataset Uber (2014).

Tecnologias

- **Framework:** `React` (Vite)
- **Bundler / Dev server:** `Vite`
- **Linguagem:** `JavaScript` (JSX)

Instalação (local)

- Requisitos: `Node.js` (v16+ recomendado) e `npm`.
- Instalar dependências:

```powershell
npm install
```

- Rodar ambiente de desenvolvimento:

```powershell
npm run dev
```

- Build para produção:

```powershell
npm run build
npm run preview
```

Como usar

- Abra `http://localhost:5173` (ou a porta reportada pelo Vite) após executar `npm run dev`.
- Interaja com os componentes principais: mapa da cidade, histograma de duração e heatmap temporal. Filtros e interações permitem explorar padrões por hora, duração e localização.

Estrutura do projeto

- `index.html` — entry HTML.
- `vite.config.js` — configuração do Vite.
- `package.json` — scripts e dependências.
- `src/`
  - `main.jsx` — ponto de entrada React.
  - `App.jsx` — componente principal que monta o dashboard.
  - `App.css`, `index.css` — estilos globais.
  - `components/`
    - `DurationHistogram.jsx` — histograma das durações das corridas.
    - `HeatmapTemporal.jsx` — heatmap temporal (variação por hora/dia).
    - `MapScatter.jsx` — mapa de dispersão dos pontos de partida/chegada (usa GeoJSON de bairros/áreas quando aplicável).
  - `utils/`
    - `csvLoader.js` — utilitário para carregar/parsear CSVs (pré-processamento para os componentes).
- `public/data/` — dataset e arquivos geográficos usados pela aplicação:
  - `UberDatasetCleaned.csv` — dataset principal já limpo/formatado.
  - `uber-raw-data-*.csv` — arquivos brutos por mês (para referência).
  - `nyc-zip-code-tabulation-areas-polygons.geojson` — polígonos de áreas/zipcodes usados pelo mapa.

Componentes principais

- `MapScatter` — Renderiza pontos de corridas no mapa; aceita dataset filtrado e ajusta transparência/cluster conforme zoom.
- `DurationHistogram` — Mostra distribuição das durações; permite selecionar intervalos para filtrar o mapa.
- `HeatmapTemporal` — Visualiza padrões por hora/dia (matriz temporal) para detectar picos de demanda.
- `csvLoader` — Carrega CSVs em formato JSON, normaliza colunas de data/hora e lat/lng.

Dados

- Local: `public/data/`
- Formato esperado: colunas contendo pelo menos `Date/Time`, `Lat`, `Lon`, `Duration` (ou nomes equivalentes conforme `csvLoader.js`).
- Arquivo principal usado pela app: `UberDatasetCleaned.csv`.

Scripts úteis

- `npm run dev` — inicia servidor de desenvolvimento (Vite).
- `npm run build` — cria build de produção.
- `npm run preview` — serve a build para preview local.

Boas práticas e observações

- Para trocar os dados, substitua `public/data/UberDatasetCleaned.csv` ou adicione novos CSVs e atualize chamadas em `csvLoader.js`.
- Se necessário, ajuste a normalização de colunas em `src/utils/csvLoader.js` caso o CSV tenha cabeçalhos diferentes.

Contribuição

- Fork + branch com mudanças.
- Abra PR descrevendo o objetivo e arquivos alterados.

Licença

- Insira a licença do projeto (ex.: `MIT`) ou solicite ao mantenedor.

Contato

- Para dúvidas, abra uma issue ou contate o autor do repositório.

Observação

- Este README foi gerado para documentar rapidamente a estrutura e uso do projeto `uber-analytics`. Ajustes finos (ex.: dependências, instruções específicas) podem ser adicionados conforme necessidade.

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
