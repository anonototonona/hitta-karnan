# Hitta kärnan — Deployment Guide

## 🎯 Vad händer när du slutar köra lokalt?

Du bygger appen för produktion och laddar upp den till en webbserver så andra kan nå den på internet.

---

## 🚀 3 snabba alternativ (rekommenderat)

### **Alternativ 1: Netlify (OM DU HAR KONTO) ⭐**

**Använd denna om du redan har Netlify-konto** — sparar tid!

#### Steg 1: Sätt upp Git (samma som Vercel)
```bash
cd "Hitta kärnan"
git init
git add .
git commit -m "Initial commit"
```

#### Steg 2: Skicka till GitHub
Se Vercel-instruktioner nedan (steg 2).

#### Steg 3: Deploy på Netlify
1. Gå till https://app.netlify.com
2. Logga in med ditt befintliga Netlify-konto
3. Klicka **"Add new site"** → **"Import an existing project"**
4. Välj GitHub
5. Välj ditt `hitta-karnan` repo
6. **Build settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`
7. Klicka **"Deploy site"**

**✅ Klart!** Din app är live på `hitta-karnan-123.netlify.app` 🎉

#### Steg 4: Environment variables (för Claude API senare)
1. Netlify dashboard → **Site settings** → **Build & deploy** → **Environment**
2. Lägg till miljövariabel:
   - **Key**: `ANTHROPIC_API_KEY`
   - **Value**: Din Claude API-nyckel
3. Klicka **Save**

**Se också:** `VERCEL-VS-NETLIFY.md` för jämförelse.

---

### **Alternativ 2: Vercel (SNABBAST & GRATIS)**

Vercel är byggd för React-appar och tar bara 2 minuter.

#### Steg 1: Sätt upp Git
```bash
cd "Hitta kärnan"
git init
git add .
git commit -m "Initial commit"
```

#### Steg 2: Skicka till GitHub
1. Gå till https://github.com/new
2. Skapa nytt repo (ex: `hitta-karnan`)
3. Följ instruktionerna för att pusha din kod:
```bash
git remote add origin https://github.com/DITT-ANVÄNDARNAMN/hitta-karnan.git
git branch -M main
git push -u origin main
```

#### Steg 3: Deploya på Vercel
1. Gå till https://vercel.com
2. Logga in med GitHub
3. Klicka "New Project"
4. Välj ditt `hitta-karnan` repo
5. Klicka "Deploy"

**✅ Klart!** Din app är live på `hitta-karnan.vercel.app` 🎉

---

### **Alternativ 3: Din egen server (AVANCERAT)**

Om du vill köra på egen server (AWS, DigitalOcean, etc.):

#### Steg 1: Build
```bash
npm run build
```
Skapar `dist/` mapp med optimerad kod.

#### Steg 2: Ladda upp `dist/` till server
```bash
# Ex med SSH:
scp -r dist/* user@server.com:/var/www/hitta-karnan/
```

#### Steg 3: Konfigurera webbserver (Nginx/Apache)
```nginx
server {
  listen 80;
  server_name hitta-karnan.com;
  root /var/www/hitta-karnan;
  index index.html;
  
  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

---

## 📋 Steg-för-steg för Vercel (rekommenderat)

### **1. Förbereda projektet**

```bash
# Gå in i projektmappen
cd "Hitta kärnan"

# Initialisera Git
git init

# Lägg till alla filer
git add .

# Gör första commit
git commit -m "Initial commit: Hitta kärnan app"
```

### **2. Skapa GitHub-repo**

1. Gå till https://github.com/new
2. **Repository name**: `hitta-karnan`
3. **Description**: "AI-verktyg för problemanalys"
4. Välj **Public** (så att Vercel kan nå det)
5. Klicka **Create repository**

### **3. Pusha kod till GitHub**

GitHub visar instruktioner. Kör dessa i din terminal:

```bash
git remote add origin https://github.com/YOUR-USERNAME/hitta-karnan.git
git branch -M main
git push -u origin main
```

### **4. Deploya på Vercel**

1. Gå till https://vercel.com
2. Klicka **Sign Up** → Välj **Continue with GitHub**
3. Logga in med GitHub
4. Vercel frågar om åtkomst — klicka **Authorize**
5. Du kommer till Vercel dashboard
6. Klicka **Add New...** → **Project**
7. Välj ditt `hitta-karnan` repo
8. **Konfiguration:**
   - **Framework**: Vite (detekteras automatiskt)
   - **Build Command**: `npm run build` (redan rätt)
   - **Output Directory**: `dist` (redan rätt)
9. Klicka **Deploy**

**Vänta 1-2 minuter...**

✅ **Klar!** Du får en URL typ: `https://hitta-karnan-a1b2c3d.vercel.app`

---

## 🎨 Anpassa domän (valfritt)

Vill du en snygg domän istället för `vercel.app`?

### **Köp domän**
- Gå till https://namecheap.com eller liknande
- Sök `hitta-karnan.se` eller `.com`
- Köp för ~$5-10/år

### **Länka till Vercel**
1. I Vercel dashboard → **Settings** → **Domains**
2. Lägg till din domän (ex: `hitta-karnan.se`)
3. Vercel visar DNS-instruktioner
4. Uppdatera DNS hos din domän-registrant (Namecheap)
5. Vänta 5-30 minuter för DNS-propagering

✅ **Klart!** `https://hitta-karnan.se` är live 🎉

---

## 🔒 Miljövariabler & Secrets

Om du senare integrerar OpenAI API:

### **1. Skapa `.env.local` lokalt**
```env
VITE_OPENAI_API_KEY=sk-...
```

### **2. Lägg till i Vercel**
1. Vercel dashboard → **Settings** → **Environment Variables**
2. Lägg till:
   - **Name**: `VITE_OPENAI_API_KEY`
   - **Value**: Din API-nyckel
3. Klicka **Save** → **Deploy** (Vercel bygger om automatiskt)

---

## 📊 Monitoring & Analytics

### **Vercel Analytics**
```bash
npm install @vercel/analytics
```

I `App.jsx`:
```javascript
import { Analytics } from '@vercel/analytics/react';

export default function App() {
  return (
    <>
      <YourComponent />
      <Analytics />
    </>
  );
}
```

### **Sentry (för error tracking)**
```bash
npm install @sentry/react
```

---

## 🔄 Uppdatera efter deployment

### **Lokalt:**
```bash
# Gör ändringar i App.jsx, etc.
git add .
git commit -m "Uppdatera UI"
git push
```

### **Vercel:**
Vercel bygger om och deploar **automatiskt** när du pushar till GitHub! ✅

Ingen manuell deployment nödvändig.

---

## 💰 Kostnader

| Plattform | Kostnad | Inkluderar |
|-----------|---------|-----------|
| **Vercel** | Gratis | 100 GB data/månad, autoredeploy |
| **Netlify** | Gratis | 100 GB data/månad, autoredeploy |
| **GitHub Pages** | Gratis | Statisk hosting (enkel setup) |
| **DigitalOcean** | $5-12/månad | Full kontroll, eget server |
| **AWS** | ~$5-20/månad | Skalbar, men komplexare |

---

## 🚨 Vanliga problem

### **"Build fails on Vercel"**
→ Vercel visar error log. Kontrollera att `npm run build` fungerar lokalt först.

### **"Environment variables inte fungerande"**
→ Se till att du använder `VITE_` prefix (för Vite). Redeploya efter att ha lagt till dem.

### **"App laddar inte efter deployment"**
→ Kontrollera att `dist/` mappen skapas lokalt (`npm run build`). Om inte, är något fel med konfigurationen.

### **"Vit skärm / ingenting syns"**
→ Öppna browser console (F12) och se om det finns JavaScript-fel. Kontrollera också att alla imports är korrekta.

---

## ✅ Checklista för Deployment

- [ ] `npm run build` fungerar lokalt
- [ ] `dist/` mappen skapas
- [ ] Git-repo skapad på GitHub
- [ ] Kod pushat till GitHub
- [ ] Vercel/Netlify integrerat
- [ ] Build lyckades på Vercel
- [ ] App är live på URL
- [ ] Du kan öppna den i browsern
- [ ] Mockad AI fungerar på live-sidan
- [ ] Delas länken med andra → de kan testa

---

## 🎯 Nästa steg (efter deployment)

1. **Integrera OpenAI API** → Byt mock mot riktig AI
2. **Lägg till analytics** → Förstå hur folk använder appen
3. **Custom domän** → Få en snygg URL
4. **Användarkonton** → Spara analyser per användare
5. **Database** → Lagra analyser permanent

---

**Lycka till med deployment!** 🚀

