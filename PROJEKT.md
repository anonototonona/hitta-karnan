# Hitta kärnan — Projektöversikt

## 🎯 Vision
Ett AI-verktyg som hjälper användare att tänka från grunden innan lösningar föreslås. Användaren lär sig skilja på symptom och grundorsak, fakta och antaganden — innan analys övergår till lösningsförslag.

## 📊 Nuläge
- **MVP skapad**: Full React-app med mockad AI-respons
- **Designstil**: Bokinspirerad — editoriell, elegant, premium
- **Språk**: Svenska
- **Status**: Fungerande prototyp, ready för vidareutveckling

---

## 🏗️ Arkitektur

### Komponenter
- `App` — Root, hanterar navigation mellan landing page och analysis view
- `LandingPage` — Hero, produktöversikt, FAQ, CTA
- `AnalysisView` — Analyskärl med state machine och chat-flöde
- `HeroInput` — Inputfält för hero-sektionen
- `ChatInput` — Inputfält för chat under analys
- `ChapterProgress` — Stegindikatorn
- `InitialCard`, `ClarifyCard`, `SummaryCard`, `SolutionsCard` — Innehållskort för varje steg
- `ExampleChips` — Klikbara exempelfrågor
- `FAQ` — Expanderbar FAQ-sektion
- `LoadingState` — Animated loading-indikator
- `UserBubble` — Användarmeddelanden i chat

### Mock-logik
- `detectCategory(text)` — Klassificerar fråga (system, decision, recurring, general)
- `MOCK` object — Innehåller alla svar per kategori för varje steg
- `getMockInitial()`, `getMockClarify()`, `getMockSummary()`, `getMockSolutions()` — Async mock-responses

### CSS-variabler
Alla färger, typografi och spacing är CSS-variabler för enkelt tema-byte:
```css
--paper: #FAF7F2 (bakgrund)
--ink: #1E1B18 (primär text)
--cognac: #8B6F47 (accent)
--serif: Cormorant Garamond (rubriker)
--sans: Manrope (brödtext)
```

---

## 📱 State Machine (4 steg)

### 1. Initial — "Kapitel 1: Förstå frågan"
- Användare beskriver sitt problem
- AI presenterar tema och två frågor: "Yta eller kärna?" + "Frågor som tar oss närmare grunden"
- Visar 3 följdfrågor

### 2. Clarify — "Kapitel 2: Skilj på yta och kärna"
- Användar svarar på initiala frågor
- AI presenterar 2 nya fördjupningsfrågor eller erbjuder "visa sammanfattning"
- Max en iteration innan summary (kontrolleras via `clarifyCount`)

### 3. Summary — "Kapitel 3: Sammanfatta grunden"
- Visar blockquote med kärnproblemet
- Visar marginalanteckningar: Det vi vet, Det vi antar, Drivkraft, Oklart
- Möjliga nästa steg
- CTA: "Visa möjliga vägar framåt"

### 4. Solutions — "Kapitel 4: Välj väg framåt"
- 2–4 lösningskort med titel, varför & risk
- CTA: "Starta ny analys" (reset)

---

## 🎨 Design-system

### Typografi
- **Rubriker**: Cormorant Garamond, italic, 300–400 vikt
- **Brödtext**: Manrope, 400–500 vikt
- **Labels**: Manrope, 10px, 600 vikt, uppercase, letter-spacing

### Färger
```
Bakgrund:     #FAF7F2 (paper)
Primär text:  #1E1B18 (ink)
Sekundär:     #5E5548 (ink-secondary)
Accent:       #8B6F47 (cognac)
Border:       #D8CFC2 (rule)
```

### Spacing & Radius
- Buttons: `40px` border-radius (pill-shaped)
- Cards: `12px` border-radius
- Marginalnot: `0 4px 4px 0` radius (endast höger nedre)
- Spacing: `24px` sidmarginaler, `28px` card padding

### Animationer
- `fadeUp` — Kort svag fade in + translateY
- `slideIn` — Frågor glider från höger
- `pulse` — Loading dots pulserar

---

## 📝 Mockad AI-logik

### Kategori-detektion
```javascript
- /system|process|tid|effektivitet/ → "system"
- /beslut|välja|två alternativ/ → "decision"
- /kommer tillbaka|igen|återkom/ → "recurring"
- fallback → "general"
```

### Varje kategori har egna svar för alla 4 steg
Exempel: "system" kategori
- initial: tema + yta/kärna + 3 frågor
- clarify: 2 nya frågor
- summary: kärn-statement + facts + assumptions + drivers + unclear + nextSteps
- solutions: 3 lösningskort

---

## 🚀 Nästa steg

### Kortsiktigt
- [ ] Integrera OpenAI API istället för mock (`.env` config)
- [ ] Lägg mock-logik i separat fil: `lib/mockAnalysis.ts`
- [ ] localStorage för senaste analyser
- [ ] Visuell refresh av tomma tillståndet
- [ ] Fler exempel på landing page

### Medellångsiktigt
- [ ] Backend för att spara analyser
- [ ] Användarkonton & history
- [ ] Möjlighet att exportera analys som PDF
- [ ] Dela analys med andra
- [ ] A/B-testing på copy/UX

### Långsiktigt
- [ ] Multi-language support
- [ ] Mobilapp (React Native)
- [ ] API för embedding i andra verktyg
- [ ] Marketplace för templates/specialiserade analyser

---

## 📂 Filstruktur

```
hitta-karnan/
├── App.jsx              (root + state machine)
├── PROJEKT.md           (denna fil)
├── package.json
├── index.html
├── lib/
│   ├── mockAnalysis.ts  (framtida: mock-logik)
│   └── openai.ts        (framtida: API-integration)
└── styles/
    └── theme.css        (framtida: utbruten CSS)
```

---

## 🎯 Framtida API-integration

Byt `getMockInitial()` mot:
```javascript
async function getInitial(text, apiKey) {
  const response = await fetch('/api/analyze/initial', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ problem: text })
  });
  return response.json();
}
```

---

## 📌 Viktiga design-principer (att bevara)

1. **Bokinspirerad känsla** — Editorial, elegant, ingen tech-SaaS-känsla
2. **Stegvis analysis** — Lösningar kommer sist, inte först
3. **Marginalanteckningar** — Synliggör antaganden och fakta
4. **Kapitelstruktur** — Försätts för att det känns lätt och strukturerat
5. **Allt på svenska** — Ingen blandning av språk
6. **Minimal, ren kod** — Inga onödiga bibliotek, inline styles för enkelheter

---

## 💡 Tips för vidareutveckling

- **Mockad AI tills API är klar**: Gör det enkelt att byta senare
- **CSS-variabler överallt**: Tema-byte blir trivialt
- **State management**: Håll analyser i context eller Redux senare
- **Accessibility**: Lägg till `aria-labels` när du uppdaterar komponenter
- **Testing**: Mockad AI gör det enkelt att testa UX-flödet

---

**Senast uppdaterad**: 2026-04-13  
**Skapad i Claude Chat, migrerad till Cowork**
