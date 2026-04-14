# Hitta kärnan — Quick Start Guide

## 🚀 Från 0 till live i 10 minuter

### **Lokalt (5 minuter)**
```bash
# 1. Installera Node.js från https://nodejs.org (om du inte redan har det)

# 2. Gå in i mappen
cd "Hitta kärnan"

# 3. Installera beroenden
npm install

# 4. Starta dev-server
npm run dev

# 5. Öppna http://localhost:5173 i browsern
```

**✅ Appen körs nu lokalt!**

---

### **Online på Vercel (5 minuter)**

#### **Förkrav:**
- Git installerat (`git --version` i terminal)
- GitHub-konto (gratis på https://github.com)

#### **Steg:**

**1. Sätt upp Git lokalt:**
```bash
cd "Hitta kärnan"
git init
git add .
git commit -m "Initial commit"
```

**2. Skapa GitHub-repo:**
- Gå till https://github.com/new
- Namnge repo: `hitta-karnan`
- Klicka "Create repository"

**3. Pusha kod:**
GitHub visar dessa kommandon. Kör dem:
```bash
git remote add origin https://github.com/DIN-USERNAME/hitta-karnan.git
git branch -M main
git push -u origin main
```

**4. Deploya på Vercel:**
- Gå till https://vercel.com
- Logga in med GitHub
- Klicka "Add New..." → "Project"
- Välj `hitta-karnan`
- Klicka "Deploy"

**✅ Klart! Din app är live på en URL typ:**
```
https://hitta-karnan-abc123.vercel.app
```

---

## 📚 Dokumentation

| Fil | Innehål |
|-----|---------|
| **README.md** | Filstruktur & utveckling |
| **SETUP.md** | Detaljerad lokal setup |
| **DEPLOYMENT.md** | Deploy till produktion |
| **PROJEKT.md** | Arkitektur & framtid |

---

## 💡 Nästa steg

### **Kortsiktigt (denna vecka)**
- [ ] Kör lokalt: `npm run dev`
- [ ] Testa mockad AI (skriva ett problem)
- [ ] Deploya på Vercel
- [ ] Dela länken med en vän

### **Medellångsiktigt (denna månad)**
- [ ] Integrera OpenAI API (byt mock mot riktig AI)
- [ ] Lägg till localStorage (spara senaste analyser)
- [ ] Custom domän (`hitta-karnan.se`)

### **Långsiktigt (senare)**
- [ ] Användarkonton
- [ ] Database för sparade analyser
- [ ] Dela & exportera analyser

---

## 🆘 Behöver du hjälp?

| Problem | Lösning |
|---------|---------|
| "npm command not found" | Installera Node.js från https://nodejs.org |
| "Port 5173 redan använd" | `npm run dev -- --port 5174` |
| "Build fails på Vercel" | Kör `npm run build` lokalt, kontrollera errors |
| "Vit skärm efter deploy" | Öppna F12 (dev tools), kontrollera console för errors |

---

## 🎉 Grattis!

Du har nu en:
- ✅ Lokal React-app
- ✅ Live deployment på Vercel
- ✅ Git-integration
- ✅ Auto-deploy setup (pushar kod → den deployas automatiskt)

**Nästa: Integrera OpenAI API för riktig AI!**

---

Se `DEPLOYMENT.md` för detaljer om hur du deployer när du inte längre vill köra lokalt.
