# Hitta kärnan — Claude API Setup Guide

## 🎯 Vad vi gör
Vi byter från **mockad AI** till **riktiga Claude API-anrop** så att appen får verklig AI-intelligens.

---

## 📋 Förkrav

- Anthropic-konto med API-åtkomst (https://console.anthropic.com)
- API-nyckel (hämtas från dashboard)
- Backend-server (Node.js + Express, eller Vercel Functions)

---

## 🚀 Snabbstart: 3 steg

### **Steg 1: Skapa API-nyckel**

1. Gå till https://console.anthropic.com
2. Logga in (eller skapa konto)
3. Klicka **"API Keys"** i menyn
4. Klicka **"Create Key"**
5. Kopiera nyckeln (den ser ut som: `sk-ant-...`)
6. **Spara den säker** — visa inte för andra!

### **Steg 2: Installera Anthropic SDK**

```bash
npm install @anthropic-ai/sdk
```

### **Steg 3: Skapa backend för API-anrop**

Se instruktioner nedan för ditt val av setup.

---

## 🔧 Två vägar: Frontend vs Backend

### **Väg A: Frontend (ENKEL, men osäker)**
- API-nyckel lagras i `.env.local`
- Kan exponeras i browser
- ❌ Inte rekommenderat för produktion

### **Väg B: Backend (SÄKER, rekommenderat)**
- Nyckel lagras på server
- Frontend anropar din backend
- Backend anropar Claude API
- ✅ Rekommenderat för produktion

**Vi fokuserar på Väg B (säker).**

---

## 🛠️ Säker Setup: Backend + Frontend

### **Alternativ 1: Vercel Functions (SNABBAST)**

Vercel kan hostad både frontend och backend-functions på samma plats.

#### **Steg 1: Skapa Vercel Function**

Skapa fil: `api/analyze.js`

```javascript
// api/analyze.js
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { problem, stage } = req.body;

  try {
    const systemPrompt = buildSystemPrompt(stage);
    const userPrompt = buildUserPrompt(problem, stage);

    const message = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
      system: systemPrompt,
    });

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    res.status(200).json({
      success: true,
      response: responseText,
    });
  } catch (error) {
    console.error("Claude API error:", error);
    res.status(500).json({
      error: "Failed to analyze problem",
      details: error.message,
    });
  }
}

function buildSystemPrompt(stage) {
  if (stage === "initial") {
    return `Du är en analytiker som hjälper användare förstå sitt problem innan lösningar föreslås.
Din roll är att:
1. Förstå vad användaren faktiskt frågar om
2. Skilja mellan symptom och grundorsak
3. Ställa djupgående frågor

Svara ALLTID på svenska. Formatera ditt svar som JSON med denna struktur:
{
  "topic": "En kort beskrivning av vad det handlar om",
  "surfaceOrCore": "En analys av om det är symptom eller grundorsak",
  "questions": ["Fråga 1", "Fråga 2", "Fråga 3"]
}`;
  }

  if (stage === "clarify") {
    return `Användaren har svarat på tidigare frågor. Din roll är att:
1. Gå djupare in i problemet
2. Ställa 1-2 nya fördjupningsfrågor baserat på deras svar
3. Röra dem närmare grundorsaken

Svara på svenska. Formatera som JSON:
{
  "questions": ["Fråga 1", "Fråga 2"]
}`;
  }

  if (stage === "summary") {
    return `Baserat på allt vi har diskuterat, sammanfatta problemet.
Din roll är att:
1. Identifiera den verkliga grundorsaken
2. Separera fakta från antaganden
3. Identifiera drivkraften bakom problemet

Svara på svenska. Formatera som JSON:
{
  "core": "En mening som sammanfattar grundproblemet",
  "facts": ["Faktum 1", "Faktum 2"],
  "assumptions": ["Antagande 1", "Antagande 2"],
  "drivers": "Vad som faktiskt driver problemet",
  "unclear": "Vad som fortfarande är oklart",
  "nextSteps": ["Nästa steg 1", "Nästa steg 2"]
}`;
  }

  if (stage === "solutions") {
    return `Nu när vi förstår grundproblemet, föreslå lösningar.
Fokusera på lösningar som adresserar ORSAKEN, inte bara symptomen.

Svara på svenska. Formatera som JSON:
{
  "solutions": [
    {
      "title": "Lösning 1",
      "why": "Varför detta matchar grundorsaken",
      "risk": "Möjlig risk eller begränsning"
    },
    {
      "title": "Lösning 2",
      "why": "Varför detta matchar grundorsaken",
      "risk": "Möjlig risk eller begränsning"
    }
  ]
}`;
  }

  return "Du är en analytiker.";
}

function buildUserPrompt(problem, stage) {
  if (stage === "initial") {
    return `Användarens problem: "${problem}"

Analysera detta problem och:
1. Identifiera vad det handlar om
2. Säg om det verkar vara ett symptom eller grundorsak
3. Ställ 3 frågor som tar oss närmare grunden`;
  }

  // För andra steg: använd tidigare konversation
  return `${problem}`;
}
```

#### **Steg 2: Uppdatera App.jsx**

Byt mock-anropet mot API-anrop:

```javascript
// Gamla raden (ta bort):
// import { getMockInitial } from "./lib/mockAnalysis";

// Nya rader (lägg till):
async function callClaudeAPI(problem, stage) {
  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ problem, stage }),
  });

  if (!response.ok) {
    throw new Error("API request failed");
  }

  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || "Unknown error");
  }

  // Parse JSON-response från Claude
  return JSON.parse(data.response);
}

// I AnalysisView komponenten, byt:
// const data = await getMockInitial(problem);
// Till:
// const data = await callClaudeAPI(problem, "initial");
```

#### **Steg 3: Lägg till miljövariabel i Vercel**

1. Gå till Vercel Dashboard
2. Välj ditt projekt
3. **Settings** → **Environment Variables**
4. Lägg till:
   - **Name**: `ANTHROPIC_API_KEY`
   - **Value**: Din API-nyckel från Anthropic
5. Klicka **Save**
6. Vercel bygger om automatiskt

**✅ Klart!** Din app använder nu riktiga Claude API-anrop! 🎉

---

### **Alternativ 2: Lokal Node.js Backend (för utveckling)**

Om du vill testa lokalt innan du deployer:

#### **Steg 1: Installera Express**

```bash
npm install express cors dotenv
```

#### **Steg 2: Skapa backend server**

Skapa fil: `server.js`

```javascript
// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Anthropic from "@anthropic-ai/sdk";

dotenv.config();

const app = express();
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

app.use(cors());
app.use(express.json());

app.post("/api/analyze", async (req, res) => {
  const { problem, stage } = req.body;

  try {
    const systemPrompt = buildSystemPrompt(stage);
    const userPrompt = buildUserPrompt(problem, stage);

    const message = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
      system: systemPrompt,
    });

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    res.json({
      success: true,
      response: responseText,
    });
  } catch (error) {
    console.error("Claude API error:", error);
    res.status(500).json({
      error: "Failed to analyze problem",
      details: error.message,
    });
  }
});

function buildSystemPrompt(stage) {
  // (samma som i Vercel Functions-exemplet ovan)
}

function buildUserPrompt(problem, stage) {
  // (samma som i Vercel Functions-exemplet ovan)
}

app.listen(3001, () => {
  console.log("Backend server running on http://localhost:3001");
});
```

#### **Steg 3: Kör servern**

Terminal 1 (backend):
```bash
node server.js
```

Terminal 2 (frontend):
```bash
npm run dev
```

**✅ Nu kan frontend anropa `http://localhost:3001/api/analyze`!**

---

## 🔐 Säkerhet: Hålla API-nyckel hemlig

### **❌ GÖR INTE:**
```javascript
const apiKey = "sk-ant-..."; // Aldrig hardcode!
const client = new Anthropic({ apiKey }); // Never i frontend!
```

### **✅ GÖR:**
```javascript
// Backend (Node.js):
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY, // Från .env
});

// Frontend - anropa backend:
const response = await fetch("/api/analyze", {
  method: "POST",
  body: JSON.stringify({ problem, stage }),
});
```

---

## 💰 Kostnad

Claude API kostar baserat på **tokens** (ord/tecken):

| Modell | Input | Output |
|--------|-------|--------|
| **Claude 3.5 Sonnet** | $3/1M tokens | $15/1M tokens |
| Claude 3 Opus | $15/1M tokens | $75/1M tokens |

**Exempel:**
- 1000 ord = ~750 tokens
- 1 fråga + svar = ~500 tokens
- Kostnad: ~$0.01 per analys

**Gratis tier:** Inga dolda kostnader, pay-as-you-go.

---

## 🧪 Testa API-anrop lokalt

Installera curl eller använd denna Node.js-script:

```javascript
// test-api.js
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function test() {
  const message = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 100,
    messages: [
      {
        role: "user",
        content: "Hej! Är du Claude?",
      },
    ],
  });

  console.log(message.content[0].text);
}

test();
```

Kör:
```bash
node test-api.js
```

---

## 📚 Nästa steg

1. **Hämta API-nyckel** från https://console.anthropic.com
2. **Välj setup**: Vercel Functions (rekommenderat) eller lokal Node.js
3. **Uppdatera App.jsx** så det anropar ditt API istället för mock
4. **Testa lokalt** innan du deployer
5. **Deploy till Vercel** och lägg till miljövariabel

---

## 🆘 Felsökning

### **"ANTHROPIC_API_KEY is undefined"**
→ Du har inte lagt till miljövariabeln. Se steg 3 ovan.

### **"Failed to analyze problem"**
→ Kontrollera API-nyckeln är korrekt. Testa med `test-api.js` script.

### **"CORS error"**
→ Se till att backend har `cors()` middleware.

### **"JSON parse error"**
→ Claude returnerade inte giltigt JSON. Uppdatera systemPrompt.

---

## ✅ Checklista

- [ ] API-nyckel hämtad från Anthropic Console
- [ ] `.env` skapad lokalt med nyckel
- [ ] `@anthropic-ai/sdk` installerad
- [ ] Backend-kod skapad (Vercel Functions eller Express)
- [ ] App.jsx uppdaterad att anropa API
- [ ] Testning lokalt fungerar
- [ ] Miljövariabel lagd till Vercel
- [ ] Deployment fungerar med riktiga API-anrop

---

**Lycka till! 🚀**

Se `README.md` för filstruktur och `DEPLOYMENT.md` för deployment-detaljer.
