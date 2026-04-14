# Hitta kärnan — Projektstruktur

## 📁 Filstruktur

```
Hitta kärnan/
├── public/                      # Statiska filer
├── src/
│   ├── App.jsx                  # Root komponenten + alla UI-komponenter
│   ├── main.jsx                 # React entry point
│   │
│   ├── lib/
│   │   └── mockAnalysis.js      # Mock AI-logik (kategori-detektion + MOCK-data)
│   │
│   └── styles/
│       └── theme.css            # CSS-variabler + global styles
│
├── index.html                   # HTML entry point
├── vite.config.js               # Vite-konfiguration
├── package.json                 # NPM-beroenden & scripts
├── .gitignore                   # Git ignore rules
├── PROJEKT.md                   # Projektöversikt
├── SETUP.md                     # Local setup guide
└── README.md                    # Denna fil
```

---

## 🔍 Filöversikt

### `src/App.jsx` (Huvudkomponent)
Innehåller:
- **State machine** — 4 steg (initial, clarify, summary, solutions)
- **Alla komponenter** — LandingPage, AnalysisView, Cards, etc.
- **Icons** — SVG-ikoner inline
- **Styles** — Importerar `theme.css`

### `src/lib/mockAnalysis.js` (Mock AI-logik)
Exporterar:
- `detectCategory(text)` — Klassificerar fråga
- `getMockInitial(text)` — Returnerar steg 1
- `getMockClarify(cat)` — Returnerar steg 2
- `getMockSummary(cat)` — Returnerar steg 3
- `getMockSolutions(cat)` — Returnerar steg 4

**OBS:** Denna fil kan enkelt bytas mot API-anrop senare.

### `src/styles/theme.css` (Design System)
CSS-variabler för:
- **Färger**: `--paper`, `--ink`, `--cognac`, etc.
- **Typografi**: `--serif`, `--sans`
- **Animationer**: `fadeUp`, `slideIn`, `pulse`
- **Utility classes**: `.anim-up`, `.margin-note`, etc.

### `index.html`
HTML-struktur med `<div id="root">` där React monteras.

### `vite.config.js`
Vite-konfiguration (dev-server, build, port 5173).

### `package.json`
NPM-scripts och beroenden:
- `npm run dev` — Starta dev-server
- `npm run build` — Build för produktion
- `npm run preview` — Visa production build

---

## 🚀 Utvecklingsflöde

### 1. **Starta dev-server**
```bash
npm run dev
```
Appen reloadar automatiskt när du sparar ändringar.

### 2. **Redigera kod**
- **UI-ändringar** → Redigera komponenter i `App.jsx`
- **Mock-logik** → Redigera `src/lib/mockAnalysis.js`
- **Styles** → Redigera `src/styles/theme.css` eller inline styles

### 3. **Se ändringarna live**
Spara filen → Appen uppdateras direkt i browsern

### 4. **Build för produktion**
```bash
npm run build
```
Skapar optimerad `dist/` mapp redo för deployment.

---

## 🔄 Framtida: API-integration

För att byta mock mot OpenAI:

**Steg 1:** Skapa `src/lib/openai.js`
```javascript
export async function getInitial(text, apiKey) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ /* prompt */ })
  });
  return response.json();
}
```

**Steg 2:** Uppdatera `App.jsx`
```javascript
// Byt denna rad:
import { getMockInitial } from "./lib/mockAnalysis";
// Till denna:
import { getInitial } from "./lib/openai";
```

**Steg 3:** Uppdatera anropet
```javascript
// const data = await getMockInitial(problem);
// Till:
const data = await getInitial(problem, apiKey);
```

---

## 📝 Noteringar

- **All CSS är inline** — Håller allt i `App.jsx` & `theme.css`
- **React HooksOnly** — Använder `useState`, `useEffect`, `useRef`
- **Inga externa komponenten** — Allt är custom-byggt
- **CSS-variabler** — Tema-byte är trivialt

---

## 💡 Tips

- **Dev Tools** — Högerklicka → "Inspect" för att debugga
- **Hot reload** — Spara filen → Automatisk reload i browsern
- **Animationer** — Justeras enkelt via CSS-variabler
- **Mockdata** — Finns i `src/lib/mockAnalysis.js` för snabb testing

---

**Se också:**
- `SETUP.md` — Installation & snabbstart
- `PROJEKT.md` — Projektöversikt & arkitektur
