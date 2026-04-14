# Hitta kärnan — Gratis Claude API Setup

## 🎯 Vad är "gratis tier"?

Claude API har **ingen gratis tier** i traditionell mening — det är **pay-as-you-go**. Men det finns sätt att komma igång utan kostnad:

1. **$5 gratis kredit** (gäller första 3 månader)
2. **Använd den för utveckling/testning**
3. **Senare**: Betala per användning (~$0.01 per analys)

---

## 🚀 Snabbstart: Gratis kredit aktivera

### **Steg 1: Skapa Anthropic-konto**

1. Gå till https://console.anthropic.com
2. Klicka **Sign Up** (eller logga in om du redan har konto)
3. Fyll i email + lösenord
4. Bekräfta email
5. Du är nu inne på konsolen

### **Steg 2: Aktivera gratis kredit**

1. I konsolen, gå till **Billing** (eller **Settings** → **Billing**)
2. Du bör se något som: **"$5 Free Credit — Expires in 3 months"**
3. Klicka **Activate** (eller det är redan aktivt automatiskt)

### **Steg 3: Hämta API-nyckel**

1. Gå till **API Keys** i menyn
2. Klicka **Create New API Key** (eller **+ Create Key**)
3. Namnge den (ex: `hitta-karnan-dev`)
4. Kopiera nyckeln — den ser ut såhär:
   ```
   sk-ant-v1-XXXXXXXXX...
   ```
5. **Spara säker** — du kan inte se den igen!

### **Steg 4: Lägg i din app**

Skapa fil: `.env.local`

```env
ANTHROPIC_API_KEY=sk-ant-v1-XXXXX...
```

---

## 💰 Hur mycket kostar det egentligen?

### **Med $5 kredit kan du:**
- ~500 analyser (á ~1000 ord vardera)
- Eller ~200 längre analyser

### **Efter krediten tar slut:**
Du måste lägga till **betalningsmetod** (kreditkort).

**Kostnad per analys:**
- Enkel fråga + svar: ~$0.005 (halv cent)
- Längre analys: ~$0.02 (2 cent)

Det är **väldigt billigt**. Med $10/månad kan du göra hundratals analyser.

---

## 🔐 Hur håller jag nyckeln säker?

### **Lokalt (utveckling):**
```
.env.local          ← Sparar nyckel här (ALDRIG committa!)
.gitignore          ← Se till att .env.local är ignorerad
```

### **I produktion (Vercel):**
1. Vercel Dashboard → **Settings** → **Environment Variables**
2. Lägg till:
   - **Name**: `ANTHROPIC_API_KEY`
   - **Value**: `sk-ant-v1-XXXXX...`
3. Klicka **Save**
4. Vercel bygger om automatiskt

**Viktigt:** Nyckeln visas aldrig i frontend-koden!

---

## 📊 Övervaka användning

### **Se din API-användning:**

1. https://console.anthropic.com
2. Gå till **Usage** eller **Billing**
3. Du ser:
   - Totala tokens använda
   - Kostnad hittills
   - Återstående kredit

### **Sätt gräns (valfritt):**

1. **Settings** → **Billing**
2. Slå på **Monthly Spend Limit**
3. Sätt ex: $50/månad
4. Om gränsen nås, stoppas API-anrop automatiskt

---

## ✅ Steg-för-steg: Från 0 till fungerande API

### **1. Skapa konto & hämta nyckel**
```
https://console.anthropic.com
→ Sign Up
→ API Keys
→ Create Key
→ Kopiera nyckeln
```

### **2. Lägg nyckel i din app**

Skapa `.env.local`:
```env
ANTHROPIC_API_KEY=sk-ant-v1-XXXXX...
```

### **3. Installera SDK**
```bash
npm install @anthropic-ai/sdk
```

### **4. Skapa backend (se API-SETUP.md)**

Skapa `api/analyze.js` eller `server.js` (med Claude API-anrop)

### **5. Uppdatera App.jsx**

Byt från mock till riktiga API-anrop (se API-SETUP.md)

### **6. Testa lokalt**
```bash
npm run dev
```

### **7. Deploy till Vercel**

Lägg till miljövariabel i Vercel dashboard

**✅ Klart!** Din app använder nu riktiga Claude-svar!

---

## 🎯 Checklista

- [ ] Anthropic-konto skapat (https://console.anthropic.com)
- [ ] Gratis kredit aktiverad ($5)
- [ ] API-nyckel hämtad
- [ ] `.env.local` skapad med nyckel
- [ ] `@anthropic-ai/sdk` installerad
- [ ] Backend-kod skräven (se API-SETUP.md)
- [ ] Lokalt test fungerar
- [ ] Miljövariabel lagd till Vercel
- [ ] Deploy funkar med riktiga API-anrop

---

## 🆘 Vanliga problem

### **"API Key is invalid"**
→ Du kopierade fel. Hämta ny nyckel från console.anthropic.com/api/keys

### **"Unauthorized"**
→ Nyckeln är inte aktiv. Kontrollera att den inte har genererats med gamla format.

### **"Rate limit exceeded"**
→ Du har använt för många requests på kort tid. Vänta några minuter.

### **"Insufficient credit"**
→ Din $5 kredit är slut. Lägg till betalningsmetod (kreditkort) i Billing.

### **".env.local inte laddad"**
→ Starta om dev-servern: `npm run dev`

---

## 📚 Nästa steg

1. **Skapa Anthropic-konto** och hämta API-nyckel
2. **Lägg nyckel i `.env.local`**
3. **Följ API-SETUP.md** för att integrera med din app
4. **Testa lokalt** innan deployment
5. **Deploy till Vercel** med miljövariabel

---

## 💡 Pro Tips

- **Testa med mindre modeller först** — spara pengar med `claude-3-5-haiku` istället för `claude-3-5-sonnet`
- **Cacha responses** — spara API-anrop genom att lagra resultat i localStorage
- **Sätt spending limit** — undvik överraskningar genom att sätta månadsgräns
- **Monitoring** — använd Vercel logs för att se API-fel

---

**Du är redo att integrera Claude API!** 🚀

Se `API-SETUP.md` för teknisk implementering.
