# Hitta kärnan — Local Setup Guide

## 🚀 Snabbstart (5 minuter)

### 1. Förutsättningar
Du behöver ha installerat:
- **Node.js** 16+ (download från https://nodejs.org)
- **npm** eller **yarn** (följer med Node.js)
- **Git** (valfritt, för versionskontroll)

Verifiera installation:
```bash
node --version  # bör vara v16+
npm --version   # bör vara 8+
```

### 2. Skapa React-projekt

#### Alternativ A: Vite (snabbast & modernast)
```bash
npm create vite@latest hitta-karnan -- --template react
cd hitta-karnan
npm install
```

#### Alternativ B: Create React App (mer klassisk)
```bash
npx create-react-app hitta-karnan
cd hitta-karnan
```

Vi rekommenderar **Vite** — det är snabbare.

### 3. Kopiera koden

1. Öppna mappen `hitta-karnan/src`
2. Byt namn på `App.jsx` till `App.jsx.old` (backup)
3. Kopiera hela innehållet från `App.jsx` (från projektet) in i en ny fil `src/App.jsx`
4. Se till att `src/main.jsx` eller `src/index.js` importerar `App` korrekt

### 4. Starta utvecklingsserver
```bash
npm run dev
```

Du bör nu kunna öppna appen på `http://localhost:5173` (Vite) eller `http://localhost:3000` (CRA).

---

## 📂 Filstruktur

Efter setup ska mappen se ut så här:

```
hitta-karnan/
├── src/
│   ├── App.jsx          ← din nya App.jsx (copy-paste från projektet)
│   ├── main.jsx         (eller index.js)
│   ├── index.css        (kan vara tom eller ha reset-styles)
│   └── App.css          (inte nödvändig, vi använder inline styles)
├── public/
│   └── index.html       (Vite) eller public/index.html (CRA)
├── package.json
└── node_modules/        (skapas automatiskt)
```

---

## 🔧 Konfiguration

### .env (valfritt nu, obligatoriskt senare för API)

Skapa filen `.env` i rotkatalogen:

```env
# För framtida OpenAI-integration
VITE_OPENAI_API_KEY=your_api_key_here
VITE_API_BASE_URL=http://localhost:3001
```

*Notera*: `VITE_` prefix är för Vite. Om du använder CRA, använd `REACT_APP_` istället.

### package.json (scripten bör redan finnas)

Vite `package.json`:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

CRA `package.json`:
```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test"
  }
}
```

---

## 🎯 Använda mockad AI lokalt

Appen är redan konfigurerad för mockad AI. Allt fungerar ur lådan:

1. Starta appen: `npm run dev`
2. Gå till `http://localhost:5173`
3. Skriv ett problem i inputfältet
4. Klicka "Starta analysen"
5. Se mockad AI-respons

**Mockad logik använder dessa kategorier:**
- "system" (innehål: process, system, tid, ineffektivitet)
- "decision" (innehål: beslut, välja, alternativ)
- "recurring" (innehål: återkommer, igen, samma problem)
- "general" (allt annat)

---

## 🔌 Framtida: Integrera OpenAI API

### Skapa backend (Node.js + Express, valfritt)

En enkel Express-server för API-anrop:

```javascript
// server.js
const express = require('express');
const cors = require('cors');
const { Configuration, OpenAIApi } = require('openai');

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAIApi(new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
}));

app.post('/api/analyze/initial', async (req, res) => {
  const { problem } = req.body;
  
  try {
    const response = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `Du är en analytiker som hjälper användaren förstå sitt problem innan lösningar ges.
                   Svara på svenska. Format ditt svar som JSON med följande struktur:
                   { "topic": "...", "surfaceOrCore": "...", "questions": [...] }`
        },
        { role: 'user', content: problem }
      ],
    });
    
    const content = response.data.choices[0].message.content;
    res.json(JSON.parse(content));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3001, () => console.log('API running on port 3001'));
```

### Byt mock mot API i App.jsx

```javascript
async function getMockInitial(text) {
  // OLD: mockad respons
  // const cat = detectCategory(text);
  // await delay(2400);
  // return { stage: "initial", category: cat, ...MOCK[cat].initial };
  
  // NEW: API-anrop
  const response = await fetch('http://localhost:3001/api/analyze/initial', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ problem: text })
  });
  
  if (!response.ok) throw new Error('API request failed');
  return response.json();
}
```

---

## 📦 Build för produktion

### Vite
```bash
npm run build
# Output: dist/ (deploy denna mapp)
```

### CRA
```bash
npm run build
# Output: build/ (deploy denna mapp)
```

Båda skapar en optimerad, minified version redo för hosting.

---

## 🌐 Deployment-alternativ

### Gratis hosting (snabb start)
- **Vercel** (deras rekommendation för React): https://vercel.com
- **Netlify**: https://netlify.com
- **GitHub Pages**: https://pages.github.com

### Med egen backend
- **Heroku** (eller Railway, Render) för Node.js-backend
- **AWS/GCP/Azure** för skalbar hosting

### Exempel: Vercel

```bash
npm install -g vercel
vercel login
vercel deploy
```

---

## 🐛 Felsökning

### Problem: "React is not defined"
**Lösning**: Vite kräver `import React from 'react'` högst upp om du använder JSX-transform:
```javascript
import { useState, useEffect, useRef } from "react";
```

Redan gjort i App.jsx ✅

### Problem: CSS laddar inte
**Lösning**: Styles är inline i App.jsx, så det bör fungera direkt. Om du vill bryta ut:
```javascript
// I App.jsx, innan return:
const CSS = `...`

// I JSX:
<style>{CSS}</style>
```

Redan gjort i App.jsx ✅

### Problem: "localhost:5173 refused to connect"
**Lösning**: 
1. Säkerställ att `npm run dev` körs
2. Vänta 10-15 sekunder för boot
3. Kontrollera att port 5173 inte redan används: `lsof -i :5173` (Mac/Linux)

### Problem: Google Fonts laddar inte
**Lösning**: Fonterna laddas från CDN. Om du är offline, fallback till system-fonter fungerar automatiskt.

---

## ✅ Checklista för lokal setup

- [ ] Node.js 16+ installerat
- [ ] Ny React-app skapad (`npm create vite` eller `npx create-react-app`)
- [ ] `App.jsx` kopierad från projektet
- [ ] `npm install` kördes
- [ ] `npm run dev` startar utan fel
- [ ] App öppnas på `localhost:5173` (eller 3000)
- [ ] Du kan skriva ett problem och se mockad AI-respons
- [ ] Alla steg (Kapitel 1-4) fungerar

---

## 🚀 Nästa steg

1. **Mockad AI fungerar** → Testa användningen, ge feedback på UX
2. **Vill du API?** → Sätt upp backend med OpenAI-integration
3. **Vill du deploya?** → Skicka till Vercel eller Netlify
4. **Vill du förbättra?** → Gör ändringar i `App.jsx`, se live i dev-server

---

## 📚 Användbara resurser

- **React docs**: https://react.dev
- **Vite docs**: https://vitejs.dev
- **OpenAI API**: https://platform.openai.com/docs
- **Tailwind (om du vill byta från inline styles)**: https://tailwindcss.com

---

**Lycka till med setup!** 🎉  
Om du kör fast, lägg till dina felmeddelanden och jag hjälper till.
