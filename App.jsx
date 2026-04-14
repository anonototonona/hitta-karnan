import { useState, useEffect, useRef } from "react";
/* ─────────────────────────────────────────────
   MOCK ANALYSIS ENGINE
   ───────────────────────────────────────────── */
const delay = (ms) => new Promise((r) => setTimeout(r, ms));
function detectCategory(text) {
  const t = text.toLowerCase();
  if (/system|process|tid|ineffektiv|långsam|verktyg|plattform/.test(t)) return "system";
  if (/beslut|välja|två alternativ|antingen|eller/.test(t)) return "decision";
  if (/kommer tillbaka|igen|återkom|upprepas|samma problem/.test(t)) return "recurring";
  return "general";
}
const MOCK = {
  system: {
    initial: {
      topic: "En fråga om system, processer eller verktyg",
      surfaceOrCore: "Det du beskriver låter som ett symptom — något som märks i vardagen. Men grundorsaken kan ligga djupare: i hur arbetsflödet är uppbyggt, vilka incitament som finns, eller vilka antaganden som styrde valet av nuvarande lösning.",
      questions: [
        "Vad är det som faktiskt går fel i praktiken — kan du ge ett konkret exempel?",
        "Har ni testat andra lösningar tidigare, och vad hände då?",
        "Vem påverkas mest av problemet, och på vilket sätt?",
      ],
    },
    clarify: [
      "Tack. Hur länge har det här problemet funnits — är det något som vuxit fram gradvis?",
      "Finns det tillfällen då det faktiskt fungerar bra? Vad skiljer de tillfällena?",
    ],
    summary: {
      core: "Problemet verkar inte primärt handla om systemet i sig, utan om att arbetsprocessen runt systemet har vuxit organiskt utan tydlig struktur. Systemet synliggör problemet, men driver det inte.",
      facts: ["Det nuvarande systemet upplevs som långsamt eller omständligt", "Flera personer har uttryckt frustration"],
      assumptions: ["Att ett nytt system automatiskt skulle lösa problemen", "Att alla använder systemet på samma sätt"],
      drivers: "Otydlig process och bristande gemensam arbetsmetod — inte tekniken i sig",
      unclear: "Hur stor del av ineffektiviteten som beror på systemet vs. processerna runtomkring",
      nextSteps: ["Kartlägg arbetsflödet oberoende av systemval", "Identifiera de tre mest tidskrävande momenten"],
    },
    solutions: [
      { title: "Processöversyn först, systembeslut sedan", why: "Om grundorsaken är processen löser inte ett nytt system problemet. Börja med att kartlägga och förbättra arbetsflödet.", risk: "Kräver tid och engagemang från teamet." },
      { title: "Pilottest med förenklad process i befintligt system", why: "Testa hypotesen att problemet är processen, inte verktyget, genom att optimera nuvarande flöde.", risk: "Befintligt system kan ha tekniska begränsningar." },
      { title: "Utvärdera nytt system med kravspec baserad på grundorsaken", why: "Om processen visar sig vara sund kan ett systembyte vara rätt. Men kravspecen måste baseras på verkliga behov.", risk: "Lång upphandlingsprocess och risk för funktionsfokus." },
    ],
  },
  decision: {
    initial: {
      topic: "Ett beslut mellan alternativ",
      surfaceOrCore: "Ofta fastnar vi i att jämföra alternativ utan att först ha klargjort vad vi faktiskt optimerar för. Frågan är kanske inte 'vilket alternativ?' utan 'vad vill vi egentligen uppnå?'",
      questions: [
        "Vad händer om du inte väljer något av alternativen alls?",
        "Vad är det viktigaste kriteriet — det som trumfar allt annat?",
        "Vem har mest att vinna respektive förlora på de olika valen?",
      ],
    },
    clarify: [
      "Intressant. Om du tänker tillbaka — hur hamnade du i den här valsituationen från början?",
      "Finns det ett tredje alternativ ni inte har övervägt?",
    ],
    summary: {
      core: "Beslutet verkar handla mindre om att välja rätt alternativ och mer om att klargöra vad ni egentligen prioriterar. Utan tydliga kriterier blir varje alternativ lika bra — och lika dåligt.",
      facts: ["Det finns minst två tydliga alternativ", "Beslutet upplevs som svårt eller laddat"],
      assumptions: ["Att bara ett av alternativen kan vara rätt", "Att beslutet måste tas nu"],
      drivers: "Otydliga prioriteringar och möjligen olika mål bland beslutsfattarna",
      unclear: "Vilka konsekvenser respektive val faktiskt har på lång sikt",
      nextSteps: ["Definiera de tre viktigaste kriterierna", "Testa varje alternativ mot dessa kriterier"],
    },
    solutions: [
      { title: "Kriteriedriven beslutsmatris", why: "Tvingar fram klarhet om vad som faktiskt är viktigast.", risk: "Kräver att alla är överens om kriterierna." },
      { title: "Reversibilitetstest", why: "Kan vi ångra detta? Om ja — välj snabbt och lär av utfallet.", risk: "Inte alla beslut är helt reversibla." },
      { title: "Pilotversion av det mest lovande alternativet", why: "Testa i liten skala istället för att besluta i teorin.", risk: "Fungerar bara om piloten ger meningsfull data." },
    ],
  },
  recurring: {
    initial: {
      topic: "Ett problem som återkommer trots åtgärder",
      surfaceOrCore: "Att ett problem återkommer är ofta ett tecken på att tidigare åtgärder behandlat symptom snarare än grundorsak. Frågan blir: vad i systemet gör att problemet återskapas?",
      questions: [
        "Vilka åtgärder har ni provat tidigare — och varför tror du de inte höll?",
        "Finns det ett mönster i när problemet dyker upp igen?",
        "Är det exakt samma problem som återkommer, eller varianter?",
      ],
    },
    clarify: [
      "Tack. Vem är det som vanligtvis upptäcker problemet, och hur lång tid tar det?",
      "Har ni förändrat något i omgivningen sedan senaste åtgärden?",
    ],
    summary: {
      core: "Problemet återkommer sannolikt för att tidigare åtgärder riktades mot det synliga felet, inte mot den underliggande strukturen som skapar det.",
      facts: ["Problemet har åtgärdats minst en gång tidigare", "Åtgärderna har haft tillfällig effekt"],
      assumptions: ["Att samma typ av åtgärd kommer fungera nästa gång", "Att problemet har en enda orsak"],
      drivers: "En strukturell eller kulturell faktor som inte adresseras av punktinsatser",
      unclear: "Exakt vilken del av systemet som återskapar problemet",
      nextSteps: ["Kartlägg hela kedjan från orsak till symptom", "Identifiera vad som INTE förändrats trots åtgärder"],
    },
    solutions: [
      { title: "Rotorsaksanalys (5 Varför)", why: "Tvingar dig att gå bakom det uppenbara.", risk: "Kan avslöja obekväma sanningar om organisation eller ledarskap." },
      { title: "Systemförändring istället för punktinsats", why: "Strukturellt problem kräver strukturell lösning.", risk: "Större förändring med längre tid till resultat." },
      { title: "Övervakningsloop med tidigt varningssystem", why: "Bygg in mekanismer för att upptäcka tidiga signaler.", risk: "Kan bli ytterligare symptomhantering om grundorsaken inte också adresseras." },
    ],
  },
  general: {
    initial: {
      topic: "En fråga som behöver brytas ned",
      surfaceOrCore: "Låt oss börja med att förstå frågan ordentligt. Ofta är det vi tror är problemet bara toppen av isberget.",
      questions: [
        "Om du kunde lösa bara en sak — vad skulle det vara?",
        "Vad har du redan provat?",
        "Vem mer påverkas av det här?",
      ],
    },
    clarify: [
      "Tack. Vad tror du själv är den mest troliga grundorsaken?",
      "Vad skulle hända om ni inte gör något alls?",
    ],
    summary: {
      core: "Problemet verkar ha flera lager. Det som syns på ytan döljer troligen en djupare fråga om prioritering, struktur eller kommunikation.",
      facts: ["Problemet upplevs som konkret och påtagligt", "Det finns ett önskat läge som skiljer sig från nuläget"],
      assumptions: ["Att problemet har en enkel lösning", "Att alla inblandade ser samma problem"],
      drivers: "Skillnaden mellan förväntad och verklig situation — och otydlighet om vad som orsakar gapet",
      unclear: "Den exakta mekanismen som skapar och upprätthåller problemet",
      nextSteps: ["Definiera nuläge och önskat läge tydligt", "Identifiera de tre viktigaste faktorerna som skapar gapet"],
    },
    solutions: [
      { title: "Strukturerad problemdefinition", why: "Innan lösningar — definiera problemet skriftligt med nuläge, önskat läge och gap.", risk: "Kan kännas långsamt under tryck att agera." },
      { title: "Intressentanalys", why: "Förstå vilka som påverkas och var det finns motstridiga intressen.", risk: "Avslöjar ibland konflikter som är svåra att hantera." },
      { title: "Snabb hypotestest", why: "Formulera den mest troliga grundorsaken som hypotes och designa ett enkelt test.", risk: "Risk att testa fel hypotes." },
    ],
  },
};
async function getMockInitial(text) {
  const cat = detectCategory(text);
  await delay(2400);
  return { stage: "initial", category: cat, ...MOCK[cat].initial };
}
async function getMockClarify(cat) { await delay(1800); return { stage: "clarify", questions: MOCK[cat].clarify }; }
async function getMockSummary(cat) { await delay(2000); return { stage: "summary", ...MOCK[cat].summary }; }
async function getMockSolutions(cat) { await delay(1500); return { stage: "solutions", solutions: MOCK[cat].solutions }; }
/* ─────────────────────────────────────────────
   ICONS
   ───────────────────────────────────────────── */
const IconArrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
);
const IconSend = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><path d="M22 2L15 22l-4-9-9-4z"/></svg>
);
const IconChevDown = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
);
const IconBookOpen = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
);
/* ─────────────────────────────────────────────
   STYLES
   ───────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Manrope:wght@300;400;500;600&display=swap');
:root {
  --paper: #FAF7F2;
  --paper-deep: #F3EDE3;
  --paper-warm: #EDE6D8;
  --ink: #1E1B18;
  --ink-secondary: #5E5548;
  --ink-muted: #9A8F80;
  --ink-faint: #BFB5A5;
  --rule: #D8CFC2;
  --rule-light: #E8E1D6;
  --cognac: #8B6F47;
  --cognac-soft: rgba(139,111,71,0.08);
  --cognac-hover: rgba(139,111,71,0.14);
  --shadow-sm: 0 1px 4px rgba(30,27,24,0.04);
  --shadow-md: 0 4px 16px rgba(30,27,24,0.06);
  --radius: 12px;
  --radius-sm: 8px;
  --serif: 'Cormorant Garamond', 'Georgia', serif;
  --sans: 'Manrope', system-ui, sans-serif;
  --ease: cubic-bezier(0.4, 0, 0.2, 1);
}
* { box-sizing: border-box; margin: 0; padding: 0; }
.hk {
  font-family: var(--sans);
  color: var(--ink);
  background: var(--paper);
  min-height: 100vh;
  line-height: 1.65;
  -webkit-font-smoothing: antialiased;
  font-size: 14px;
  font-weight: 400;
}
::selection { background: var(--cognac-soft); }
@keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes pulse { 0%,80%,100% { opacity:.25; } 40% { opacity:.9; } }
@keyframes slideIn { from { opacity:0; transform:translateX(-8px); } to { opacity:1; transform:translateX(0); } }
.anim-up { animation: fadeUp .7s var(--ease) both; }
.anim-in { animation: fadeIn .5s var(--ease) both; }
.anim-slide { animation: slideIn .5s var(--ease) both; }
.dots { display:flex; gap:5px; align-items:center; padding:8px 0; }
.dots span { width:6px; height:6px; border-radius:50%; background:var(--ink-muted); }
.dots span:nth-child(1) { animation: pulse 1.4s infinite; }
.dots span:nth-child(2) { animation: pulse 1.4s infinite .2s; }
.dots span:nth-child(3) { animation: pulse 1.4s infinite .4s; }
.ch-label {
  font-family: var(--sans);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: .14em;
  text-transform: uppercase;
  color: var(--cognac);
}
.ed-hr {
  border: none;
  height: 1px;
  background: var(--rule);
  margin: 32px 0;
}
.margin-note {
  border-left: 2px solid var(--cognac);
  padding: 14px 18px;
  background: var(--cognac-soft);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  font-size: 13px;
  color: var(--ink-secondary);
  line-height: 1.7;
}
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--rule); border-radius: 3px; }
`;
/* ─────────────────────────────────────────────
   SHARED COMPONENTS
   ───────────────────────────────────────────── */
function LoadingState({ text }) {
  return (
    <div className="anim-in" style={{ display:"flex", flexDirection:"column", gap:8, padding:"4px 0" }}>
      <span style={{ fontSize:14, color:"var(--ink-muted)", fontStyle:"italic", fontFamily:"var(--serif)" }}>{text}</span>
      <div className="dots"><span/><span/><span/></div>
    </div>
  );
}
const CHAPTERS = [
  { key:"initial", num:"1", label:"Förstå frågan" },
  { key:"clarify", num:"2", label:"Skilj på yta och kärna" },
  { key:"summary", num:"3", label:"Sammanfatta grunden" },
  { key:"solutions", num:"4", label:"Välj väg framåt" },
];
function ChapterProgress({ current }) {
  const idx = CHAPTERS.findIndex(c => c.key === current);
  return (
    <div style={{ display:"flex", alignItems:"stretch", gap:0, padding:"20px 0 16px", justifyContent:"center", flexWrap:"wrap" }}>
      {CHAPTERS.map((ch, i) => {
        const active = i === idx;
        const done = i < idx;
        return (
          <div key={ch.key} style={{ display:"flex", alignItems:"center" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 16px", position:"relative" }}>
              <span style={{
                fontFamily:"var(--serif)", fontSize:22, fontWeight:300,
                color: active ? "var(--cognac)" : done ? "var(--ink-secondary)" : "var(--ink-faint)",
                fontStyle:"italic", lineHeight:1, transition:"color .3s var(--ease)",
              }}>{ch.num}</span>
              <span style={{
                fontSize:12, fontWeight: active ? 500 : 400, letterSpacing:".02em",
                color: active ? "var(--ink)" : done ? "var(--ink-secondary)" : "var(--ink-muted)",
                transition:"color .3s var(--ease)",
              }}>{ch.label}</span>
              {active && <div style={{
                position:"absolute", bottom:0, left:16, right:16, height:2,
                background:"var(--cognac)", borderRadius:1,
              }}/>}
            </div>
            {i < CHAPTERS.length - 1 && (
              <div style={{ width:28, height:1, background: done ? "var(--cognac)" : "var(--rule-light)", transition:"background .3s var(--ease)" }}/>
            )}
          </div>
        );
      })}
    </div>
  );
}
function ExampleChips({ onSelect }) {
  const chips = [
    "Behöver vi verkligen köpa ett nytt system?",
    "Varför kommer samma problem tillbaka trots åtgärder?",
    "Vilket av två alternativ är egentligen rätt beslut?",
  ];
  return (
    <div style={{ display:"flex", flexWrap:"wrap", gap:10, justifyContent:"center", marginTop:20 }}>
      {chips.map((c, i) => (
        <button key={i} onClick={() => onSelect(c)} style={{
          padding:"10px 20px", borderRadius:40, border:"1px solid var(--rule)",
          background:"var(--paper)", color:"var(--ink-secondary)",
          fontSize:13, cursor:"pointer", transition:"all .25s var(--ease)",
          fontFamily:"var(--sans)", lineHeight:1.4, fontWeight:400,
        }}
        onMouseOver={e => { e.currentTarget.style.borderColor="var(--cognac)"; e.currentTarget.style.background="var(--cognac-soft)"; e.currentTarget.style.color="var(--ink)"; }}
        onMouseOut={e => { e.currentTarget.style.borderColor="var(--rule)"; e.currentTarget.style.background="var(--paper)"; e.currentTarget.style.color="var(--ink-secondary)"; }}
        >{c}</button>
      ))}
    </div>
  );
}
function HeroInput({ onSubmit }) {
  const [val, setVal] = useState("");
  const submit = () => { if (val.trim()) { onSubmit(val.trim()); setVal(""); } };
  return (
    <div style={{ width:"100%", maxWidth:620, margin:"0 auto" }}>
      <label style={{
        display:"block", fontSize:11, fontWeight:600, letterSpacing:".1em",
        color:"var(--ink-muted)", marginBottom:10, textTransform:"uppercase", textAlign:"left",
      }}>Vad vill du förstå bättre?</label>
      <div style={{
        background:"var(--paper)", borderRadius:"var(--radius)", border:"1px solid var(--rule)",
        padding:4, boxShadow:"var(--shadow-md)",
      }}>
        <textarea value={val} onChange={e => setVal(e.target.value)}
          onKeyDown={e => { if (e.key==="Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
          placeholder="Beskriv ett problem, en fråga eller ett beslut…"
          rows={3}
          style={{
            width:"100%", border:"none", outline:"none", resize:"none",
            padding:"18px 20px 10px", fontSize:15, fontFamily:"var(--sans)",
            color:"var(--ink)", background:"transparent", lineHeight:1.7,
          }}
        />
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"6px 10px 10px", gap:12 }}>
          <span style={{ fontSize:12, color:"var(--ink-faint)", maxWidth:340, lineHeight:1.5 }}>
            Vi börjar inte med lösningar. Först hjälper AI dig att läsa problemet djupare.
          </span>
          <button onClick={submit} disabled={!val.trim()} style={{
            display:"flex", alignItems:"center", gap:8, padding:"10px 24px",
            borderRadius:40, border:"none",
            cursor: val.trim() ? "pointer" : "default",
            background: val.trim() ? "var(--ink)" : "var(--rule)",
            color: val.trim() ? "var(--paper)" : "var(--ink-faint)",
            fontSize:13, fontWeight:500, fontFamily:"var(--sans)",
            transition:"all .3s var(--ease)", flexShrink:0, whiteSpace:"nowrap",
          }}>
            Starta analysen <IconArrow />
          </button>
        </div>
      </div>
      <ExampleChips onSelect={t => setVal(t)} />
    </div>
  );
}
function ChatInput({ onSubmit, placeholder }) {
  const [val, setVal] = useState("");
  const submit = () => { if (val.trim()) { onSubmit(val.trim()); setVal(""); } };
  return (
    <div style={{
      display:"flex", gap:8, background:"var(--paper)", borderRadius:"var(--radius)",
      border:"1px solid var(--rule)", padding:5, boxShadow:"var(--shadow-sm)",
    }}>
      <input value={val} onChange={e => setVal(e.target.value)}
        onKeyDown={e => { if (e.key==="Enter") submit(); }}
        placeholder={placeholder}
        style={{
          flex:1, border:"none", outline:"none", padding:"12px 16px",
          fontSize:14, fontFamily:"var(--sans)", color:"var(--ink)", background:"transparent",
        }}
      />
      <button onClick={submit} disabled={!val.trim()} style={{
        width:42, height:42, borderRadius:40, border:"none",
        background: val.trim() ? "var(--ink)" : "var(--rule-light)",
        color: val.trim() ? "var(--paper)" : "var(--ink-faint)",
        cursor: val.trim() ? "pointer" : "default", display:"flex",
        alignItems:"center", justifyContent:"center", transition:"all .3s var(--ease)", flexShrink:0,
      }}><IconSend /></button>
    </div>
  );
}
function UserBubble({ text }) {
  return (
    <div className="anim-up" style={{ display:"flex", justifyContent:"flex-end" }}>
      <div style={{
        background:"var(--ink)", color:"var(--paper)", borderRadius:"var(--radius)",
        borderBottomRightRadius:4, padding:"14px 22px", maxWidth:"78%",
        fontSize:14, lineHeight:1.65,
      }}>{text}</div>
    </div>
  );
}
function SectionHead({ chapter, title }) {
  return (
    <div style={{ marginBottom:14 }}>
      {chapter && <span className="ch-label">{chapter}</span>}
      <h3 style={{
        fontFamily:"var(--serif)", fontSize:21, fontWeight:400, color:"var(--ink)",
        marginTop:4, lineHeight:1.3, fontStyle:"italic",
      }}>{title}</h3>
    </div>
  );
}
function PageCard({ children, d = 0 }) {
  return (
    <div className="anim-up" style={{
      background:"var(--paper)", borderRadius:"var(--radius)",
      padding:"28px 30px", border:"1px solid var(--rule-light)",
      boxShadow:"var(--shadow-sm)", animationDelay:`${d}ms`,
    }}>{children}</div>
  );
}
/* --- Stage Cards --- */
function InitialCard({ data }) {
  return (
    <PageCard>
      <SectionHead chapter="Kapitel 1" title="Förstå frågan" />
      <div className="ed-hr" style={{ margin:"16px 0 20px" }}/>
      <p style={{ fontSize:10, fontWeight:600, letterSpacing:".12em", textTransform:"uppercase", color:"var(--ink-muted)", marginBottom:6 }}>Ämne</p>
      <p style={{ fontFamily:"var(--serif)", fontSize:18, fontWeight:400, color:"var(--ink)", marginBottom:20, lineHeight:1.4 }}>
        {data.topic}
      </p>
      <p style={{ fontSize:10, fontWeight:600, letterSpacing:".12em", textTransform:"uppercase", color:"var(--ink-muted)", marginBottom:6 }}>Yta eller kärna?</p>
      <div className="margin-note" style={{ marginBottom:24 }}>
        {data.surfaceOrCore}
      </div>
      <p style={{ fontSize:10, fontWeight:600, letterSpacing:".12em", textTransform:"uppercase", color:"var(--ink-muted)", marginBottom:10 }}>Frågor som tar oss närmare grunden</p>
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {data.questions.map((q, i) => (
          <div key={i} className="anim-slide" style={{
            display:"flex", gap:14, alignItems:"baseline",
            padding:"14px 18px", background:"var(--paper-deep)",
            borderRadius:"var(--radius-sm)", animationDelay:`${300 + i * 120}ms`,
          }}>
            <span style={{ fontFamily:"var(--serif)", fontSize:22, color:"var(--cognac)", fontStyle:"italic", fontWeight:300, flexShrink:0, lineHeight:1 }}>{i + 1}</span>
            <span style={{ fontSize:14, color:"var(--ink)", lineHeight:1.65 }}>{q}</span>
          </div>
        ))}
      </div>
      <p style={{ fontSize:14, color:"var(--ink-muted)", marginTop:20, fontStyle:"italic", fontFamily:"var(--serif)", lineHeight:1.6 }}>
        Svara på en eller flera av frågorna ovan, eller beskriv fritt vad du tänker.
      </p>
    </PageCard>
  );
}
function ClarifyCard({ data }) {
  return (
    <PageCard>
      <SectionHead chapter="Kapitel 2" title="Skilj på yta och kärna" />
      <div className="ed-hr" style={{ margin:"16px 0 20px" }}/>
      <p style={{ fontSize:14, color:"var(--ink-secondary)", marginBottom:16, lineHeight:1.7 }}>
        Bra — vi tar oss djupare. Här är det vi behöver förstå härnäst.
      </p>
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {data.questions.map((q, i) => (
          <div key={i} className="margin-note anim-slide" style={{ animationDelay:`${i * 150}ms` }}>
            {q}
          </div>
        ))}
      </div>
      <p style={{ fontSize:14, color:"var(--ink-muted)", marginTop:18, fontStyle:"italic", fontFamily:"var(--serif)" }}>
        Svara fritt — eller skriv "visa sammanfattning" om du är redo att gå vidare.
      </p>
    </PageCard>
  );
}
function SummaryCard({ data, onShowSolutions }) {
  const sections = [
    { label:"Det vi vet", items:data.facts, type:"list" },
    { label:"Det vi antar", items:data.assumptions, type:"list" },
    { label:"Trolig drivmekanism", items:data.drivers, type:"text" },
    { label:"Fortfarande oklart", items:data.unclear, type:"text" },
  ];
  return (
    <PageCard>
      <SectionHead chapter="Kapitel 3" title="Sammanfatta grunden" />
      <div className="ed-hr" style={{ margin:"16px 0 20px" }}/>
      <p style={{ fontSize:10, fontWeight:600, letterSpacing:".12em", textTransform:"uppercase", color:"var(--ink-muted)", marginBottom:8 }}>Vad problemet egentligen verkar handla om</p>
      <blockquote style={{
        fontFamily:"var(--serif)", fontSize:18, fontWeight:300, fontStyle:"italic",
        color:"var(--ink)", lineHeight:1.5, padding:"20px 24px", margin:"0 0 28px",
        background:"var(--paper-warm)", borderRadius:"var(--radius-sm)",
        borderLeft:"3px solid var(--cognac)",
      }}>
        {data.core}
      </blockquote>
      <p className="ch-label" style={{ marginBottom:12 }}>Marginalanteckningar</p>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(230px, 1fr))", gap:12 }}>
        {sections.map((s, i) => (
          <div key={i} style={{
            padding:"16px 18px", borderRadius:"var(--radius-sm)",
            borderLeft:"2px solid var(--cognac)", background:"var(--cognac-soft)",
          }}>
            <span style={{ fontSize:10, fontWeight:600, letterSpacing:".1em", textTransform:"uppercase", color:"var(--ink-muted)" }}>{s.label}</span>
            {s.type === "list" ? (
              <ul style={{ margin:"8px 0 0 14px", fontSize:13, color:"var(--ink-secondary)", lineHeight:1.7, listStyleType:"'–  '" }}>
                {s.items.map((it,j) => <li key={j} style={{ marginBottom:2 }}>{it}</li>)}
              </ul>
            ) : (
              <p style={{ marginTop:8, fontSize:13, color:"var(--ink-secondary)", lineHeight:1.7 }}>{s.items}</p>
            )}
          </div>
        ))}
      </div>
      {data.nextSteps && (
        <div style={{ marginTop:24 }}>
          <p style={{ fontSize:10, fontWeight:600, letterSpacing:".12em", textTransform:"uppercase", color:"var(--ink-muted)", marginBottom:8 }}>Möjliga nästa steg</p>
          {data.nextSteps.map((s, i) => (
            <p key={i} style={{ fontSize:13, color:"var(--ink-secondary)", lineHeight:1.7, paddingLeft:16, position:"relative", marginBottom:2 }}>
              <span style={{ position:"absolute", left:0, color:"var(--cognac)" }}>→</span>{s}
            </p>
          ))}
        </div>
      )}
      <div style={{ marginTop:28, textAlign:"center" }}>
        <button onClick={onShowSolutions} style={{
          padding:"12px 28px", borderRadius:40, border:"none",
          background:"var(--ink)", color:"var(--paper)", fontSize:13,
          fontWeight:500, cursor:"pointer", fontFamily:"var(--sans)",
          display:"inline-flex", alignItems:"center", gap:8, transition:"all .3s var(--ease)",
        }}>
          Visa möjliga vägar framåt <IconArrow />
        </button>
      </div>
    </PageCard>
  );
}
function SolutionsCard({ data, onReset }) {
  return (
    <PageCard>
      <SectionHead chapter="Kapitel 4" title="Välj väg framåt" />
      <div className="ed-hr" style={{ margin:"16px 0 20px" }}/>
      <p style={{ fontSize:14, color:"var(--ink-secondary)", marginBottom:20, lineHeight:1.7 }}>
        Baserat på analysen — här är förslag som riktar sig mot grundorsaken, inte bara symptomen.
      </p>
      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        {data.solutions.map((s, i) => (
          <div key={i} className="anim-up" style={{
            padding:"22px 24px", borderRadius:"var(--radius-sm)",
            border:"1px solid var(--rule-light)", background:"var(--paper)",
            animationDelay:`${i * 150}ms`,
          }}>
            <h4 style={{ fontFamily:"var(--serif)", fontSize:18, fontWeight:400, color:"var(--ink)", marginBottom:10, fontStyle:"italic" }}>
              {s.title}
            </h4>
            <p style={{ fontSize:13, color:"var(--ink-secondary)", lineHeight:1.7, marginBottom:12 }}>
              <span style={{ fontWeight:600, fontSize:10, letterSpacing:".08em", textTransform:"uppercase", color:"var(--ink-muted)" }}>Varför: </span>
              {s.why}
            </p>
            <div style={{
              fontSize:12, color:"var(--ink-muted)", padding:"10px 14px",
              background:"var(--paper-warm)", borderRadius:"var(--radius-sm)",
              borderLeft:"2px solid var(--cognac)", lineHeight:1.6,
            }}>
              {s.risk}
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop:28, textAlign:"center" }}>
        <button onClick={onReset} style={{
          padding:"12px 28px", borderRadius:40,
          border:"1px solid var(--rule)", background:"var(--paper)",
          color:"var(--ink)", fontSize:13, fontWeight:500, cursor:"pointer",
          fontFamily:"var(--sans)", display:"inline-flex", alignItems:"center", gap:8,
          transition:"all .25s var(--ease)",
        }}
        onMouseOver={e => e.currentTarget.style.borderColor = "var(--cognac)"}
        onMouseOut={e => e.currentTarget.style.borderColor = "var(--rule)"}
        >Starta ny analys</button>
      </div>
    </PageCard>
  );
}
/* --- FAQ --- */
function FAQ() {
  const [open, setOpen] = useState(null);
  const faqs = [
    { q:"Är det här bara vanlig AI med ett nytt namn?", a:"Nej. Skillnaden är att Hitta kärnan inte börjar med svar. Det börjar med att hjälpa dig läsa problemet djupare — skilja på det som syns och det som driver — så att lösningarna blir mer träffsäkra." },
    { q:"Måste jag formulera problemet perfekt?", a:"Inte alls. Skriv som du tänker. En mening räcker. Verktyget hjälper dig att strukturera och fördjupa frågan steg för steg, som att läsa om ett stycke tills innebörden klarnar." },
    { q:"Får jag lösningar också?", a:"Ja — men inte förrän vi har läst klart. Först hjälper vi dig att förstå vad problemet egentligen handlar om. Sedan kommer lösningsförslag som matchar grundorsaken, inte bara symptomen." },
    { q:"Vad kan jag använda det till?", a:"Allt som kräver bättre tänkande innan handling. Beslut, strategiska frågor, återkommande problem, tekniska val, organisationsutmaningar — eller helt enkelt när du behöver tänka klarare innan du agerar." },
  ];
  return (
    <div style={{ maxWidth:600, margin:"0 auto" }}>
      {faqs.map((f, i) => (
        <div key={i} style={{ borderBottom: i < faqs.length - 1 ? "1px solid var(--rule-light)" : "none" }}>
          <button onClick={() => setOpen(open === i ? null : i)} style={{
            width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center",
            padding:"22px 0", border:"none", background:"transparent", cursor:"pointer",
            textAlign:"left", fontFamily:"var(--sans)", fontSize:15, fontWeight:500,
            color:"var(--ink)", lineHeight:1.4,
          }}>
            {f.q}
            <span style={{ transform: open===i ? "rotate(180deg)" : "none", transition:"transform .3s var(--ease)", flexShrink:0, marginLeft:16, color:"var(--ink-muted)" }}>
              <IconChevDown />
            </span>
          </button>
          {open === i && (
            <div className="anim-in" style={{ paddingBottom:22, fontSize:14, color:"var(--ink-secondary)", lineHeight:1.75 }}>
              {f.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
/* ─────────────────────────────────────────────
   LANDING PAGE
   ───────────────────────────────────────────── */
function LandingPage({ onStart }) {
  const howSteps = [
    { num:"01", title:"Beskriv problemet", desc:"Skriv fritt. Det behöver inte vara perfekt formulerat. Första utkastet räcker." },
    { num:"02", title:"AI ställer frågor", desc:"Verktyget hjälper dig läsa mellan raderna — skilja symptom från grundorsak." },
    { num:"03", title:"Se vad som driver utfallet", desc:"Fakta, antaganden och drivkrafter sammanfattas i en tydlig bild." },
    { num:"04", title:"Vägar framåt", desc:"Lösningar som matchar den verkliga grundorsaken — inte bara det uppenbara." },
  ];
  const diffPoints = [
    { title:"De flesta verktyg vill ge svar direkt", desc:"Vi hjälper dig att ställa rätt fråga först. Analysen kommer före lösningen." },
    { title:"Strukturerat tänkande i kapitel", desc:"Varje analys följer en beprövad metod för att bryta ner och förstå komplexa problem." },
    { title:"Dina antaganden synliggörs", desc:"Vi skiljer på vad du vet, vad du tror och vad som faktiskt driver utfallet." },
  ];
  return (
    <div className="hk">
      {/* Nav */}
      <nav style={{ padding:"22px 32px", display:"flex", justifyContent:"space-between", alignItems:"center", maxWidth:1060, margin:"0 auto" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <IconBookOpen />
          <span style={{ fontFamily:"var(--serif)", fontSize:22, fontWeight:400, color:"var(--ink)" }}>Hitta kärnan</span>
        </div>
        <span style={{ fontSize:10, fontWeight:600, letterSpacing:".14em", color:"var(--ink-muted)", textTransform:"uppercase" }}>
          Tänk från grunden
        </span>
      </nav>
      {/* Hero */}
      <section style={{ padding:"100px 24px 80px", textAlign:"center", maxWidth:1060, margin:"0 auto" }}>
        <div className="anim-up">
          <p className="ch-label" style={{ marginBottom:18 }}>Analysverktyg</p>
          <h1 style={{
            fontFamily:"var(--serif)", fontSize:"clamp(34px, 5.5vw, 56px)",
            fontWeight:300, lineHeight:1.1, color:"var(--ink)", marginBottom:26,
            fontStyle:"italic", letterSpacing:"-0.01em",
          }}>
            Läs problemet djupare<br />innan du väljer lösning
          </h1>
          <p style={{
            fontSize:"clamp(14px, 1.8vw, 16px)", color:"var(--ink-secondary)",
            maxWidth:520, margin:"0 auto 52px", lineHeight:1.8, fontWeight:400,
          }}>
            Beskriv ett problem, en fråga eller ett beslut. Hitta kärnan hjälper dig att läsa mellan raderna, skilja på symptom och grundorsak och förstå vad som faktiskt driver utfallet — innan du går vidare till lösningar.
          </p>
        </div>
        <div className="anim-up" style={{ animationDelay:"200ms" }}>
          <HeroInput onSubmit={onStart} />
        </div>
      </section>
      <div style={{ maxWidth:100, margin:"0 auto" }}><div className="ed-hr"/></div>
      {/* How it works */}
      <section style={{ padding:"70px 24px", maxWidth:860, margin:"0 auto" }}>
        <p className="ch-label" style={{ textAlign:"center", marginBottom:8 }}>Metoden</p>
        <h2 style={{ fontFamily:"var(--serif)", fontSize:30, textAlign:"center", marginBottom:56, fontWeight:300, fontStyle:"italic" }}>
          Så läser vi problemet
        </h2>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))", gap:16 }}>
          {howSteps.map((s, i) => (
            <div key={i} className="anim-up" style={{
              padding:"30px 24px", borderRadius:"var(--radius)", background:"var(--paper)",
              border:"1px solid var(--rule-light)", animationDelay:`${i * 100}ms`,
            }}>
              <span style={{ fontFamily:"var(--serif)", fontSize:38, fontWeight:300, color:"var(--ink-faint)", fontStyle:"italic", lineHeight:1 }}>{s.num}</span>
              <h3 style={{ fontSize:14, fontWeight:600, margin:"16px 0 8px", color:"var(--ink)", letterSpacing:".01em" }}>{s.title}</h3>
              <p style={{ fontSize:13, color:"var(--ink-secondary)", lineHeight:1.7 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>
      {/* Why different */}
      <section style={{ padding:"50px 24px 70px", maxWidth:860, margin:"0 auto" }}>
        <p className="ch-label" style={{ textAlign:"center", marginBottom:8 }}>Perspektiv</p>
        <h2 style={{ fontFamily:"var(--serif)", fontSize:30, textAlign:"center", marginBottom:56, fontWeight:300, fontStyle:"italic" }}>
          De flesta börjar i fel kapitel
        </h2>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(230px, 1fr))", gap:16 }}>
          {diffPoints.map((p, i) => (
            <div key={i} className="anim-up" style={{
              padding:"28px 24px", borderRadius:"var(--radius)",
              borderLeft:"2px solid var(--cognac)", background:"var(--cognac-soft)",
              animationDelay:`${i * 100}ms`,
            }}>
              <h3 style={{ fontFamily:"var(--serif)", fontSize:17, fontWeight:400, marginBottom:10, color:"var(--ink)", fontStyle:"italic", lineHeight:1.35 }}>{p.title}</h3>
              <p style={{ fontSize:13, color:"var(--ink-secondary)", lineHeight:1.7 }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </section>
      {/* FAQ */}
      <section style={{ padding:"50px 24px 70px", maxWidth:860, margin:"0 auto" }}>
        <p className="ch-label" style={{ textAlign:"center", marginBottom:8 }}>Frågor & svar</p>
        <h2 style={{ fontFamily:"var(--serif)", fontSize:30, textAlign:"center", marginBottom:48, fontWeight:300, fontStyle:"italic" }}>
          Vanliga frågor
        </h2>
        <FAQ />
      </section>
      {/* CTA */}
      <section style={{
        padding:"80px 24px", textAlign:"center",
        background:"var(--paper-deep)", borderRadius:"var(--radius)",
        maxWidth:860, margin:"0 auto 60px", border:"1px solid var(--rule-light)",
      }}>
        <span style={{ display:"inline-block", marginBottom:20, color:"var(--cognac)" }}><IconBookOpen /></span>
        <h2 style={{ fontFamily:"var(--serif)", fontSize:"clamp(24px, 4vw, 38px)", fontWeight:300, fontStyle:"italic", marginBottom:16, lineHeight:1.2, color:"var(--ink)" }}>
          Börja på första sidan
        </h2>
        <p style={{ fontSize:14, color:"var(--ink-secondary)", maxWidth:420, margin:"0 auto 32px", lineHeight:1.7 }}>
          Varje tydlig lösning börjar med en bättre läsning av problemet.
        </p>
        <button onClick={() => window.scrollTo({ top:0, behavior:"smooth" })} style={{
          padding:"14px 32px", borderRadius:40, border:"none", background:"var(--ink)",
          color:"var(--paper)", fontSize:14, fontWeight:500, cursor:"pointer",
          fontFamily:"var(--sans)", transition:"all .3s var(--ease)",
        }}>
          Starta din analys ↑
        </button>
      </section>
      <footer style={{ textAlign:"center", padding:"36px 24px 40px", fontSize:12, color:"var(--ink-faint)" }}>
        <span style={{ fontFamily:"var(--serif)", fontStyle:"italic" }}>Hitta kärnan</span> — tänk från grunden, lös rätt problem
      </footer>
    </div>
  );
}
/* ─────────────────────────────────────────────
   ANALYSIS VIEW
   ───────────────────────────────────────────── */
function AnalysisView({ problem, onReset }) {
  const [stage, setStage] = useState("loading_initial");
  const [category, setCategory] = useState(null);
  const [messages, setMessages] = useState([]);
  const [clarifyCount, setClarifyCount] = useState(0);
  const threadRef = useRef(null);
  useEffect(() => {
    if (threadRef.current) threadRef.current.scrollTo({ top: threadRef.current.scrollHeight, behavior:"smooth" });
  }, [messages, stage]);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setMessages([{ type:"loading", content:"Öppnar första sidan…" }]);
      await delay(900);
      if (cancelled) return;
      setMessages([{ type:"loading", content:"Läser mellan raderna…" }]);
      const data = await getMockInitial(problem);
      if (cancelled) return;
      setCategory(data.category);
      setMessages([{ type:"assistant", stageType:"initial", stageData:data }]);
      setStage("initial");
    })();
    return () => { cancelled = true; };
  }, [problem]);
  const handleUserResponse = async (text) => {
    const isSummaryReq = /sammanfattning|visa sammanfattning|klar|redo/.test(text.toLowerCase());
    if (stage === "initial" || (stage === "clarify" && !isSummaryReq && clarifyCount < 1)) {
      setMessages(prev => [...prev.filter(m => m.type!=="loading"), { type:"user", content:text }, { type:"loading", content:"Markerar det som verkligen betyder något…" }]);
      const data = await getMockClarify(category);
      setMessages(prev => [...prev.filter(m => m.type!=="loading"), { type:"assistant", stageType:"clarify", stageData:data }]);
      setStage("clarify");
      setClarifyCount(c => c + 1);
    } else {
      setMessages(prev => [...prev.filter(m => m.type!=="loading"), { type:"user", content:text }, { type:"loading", content:"Sammanfattar kärnan…" }]);
      const data = await getMockSummary(category);
      setMessages(prev => [...prev.filter(m => m.type!=="loading"), { type:"assistant", stageType:"summary", stageData:data }]);
      setStage("summary");
    }
  };
  const handleShowSolutions = async () => {
    setMessages(prev => [...prev, { type:"loading", content:"Tar fram vägar framåt…" }]);
    const data = await getMockSolutions(category);
    setMessages(prev => [...prev.filter(m => m.type!=="loading"), { type:"assistant", stageType:"solutions", stageData:data }]);
    setStage("solutions");
  };
  const displayStage = stage.startsWith("loading") ? "initial" : stage;
  return (
    <div className="hk" style={{ display:"flex", flexDirection:"column", height:"100vh" }}>
      <header style={{
        padding:"14px 24px", borderBottom:"1px solid var(--rule-light)",
        display:"flex", justifyContent:"space-between", alignItems:"center",
        background:"var(--paper)", flexShrink:0,
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }} onClick={onReset}>
          <IconBookOpen />
          <span style={{ fontFamily:"var(--serif)", fontSize:20, color:"var(--ink)" }}>Hitta kärnan</span>
        </div>
        <button onClick={onReset} style={{
          padding:"7px 18px", borderRadius:40, border:"1px solid var(--rule)",
          background:"transparent", fontSize:12, color:"var(--ink-secondary)",
          cursor:"pointer", fontFamily:"var(--sans)", fontWeight:500,
          transition:"border-color .25s var(--ease)",
        }}
        onMouseOver={e => e.currentTarget.style.borderColor = "var(--cognac)"}
        onMouseOut={e => e.currentTarget.style.borderColor = "var(--rule)"}
        >Ny analys</button>
      </header>
      <div style={{ padding:"0 24px", borderBottom:"1px solid var(--rule-light)", background:"var(--paper)", flexShrink:0, overflowX:"auto" }}>
        <ChapterProgress current={displayStage} />
      </div>
      <div ref={threadRef} style={{ flex:1, overflow:"auto", padding:"28px 24px 20px" }}>
        <div style={{ maxWidth:700, margin:"0 auto", display:"flex", flexDirection:"column", gap:18 }}>
          <UserBubble text={problem} />
          {messages.map((m, i) => {
            if (m.type === "user") return <UserBubble key={i} text={m.content} />;
            if (m.type === "loading") return <LoadingState key={`ld-${i}`} text={m.content} />;
            if (m.type === "assistant") {
              if (m.stageType === "initial") return <InitialCard key={i} data={m.stageData} />;
              if (m.stageType === "clarify") return <ClarifyCard key={i} data={m.stageData} />;
              if (m.stageType === "summary") return <SummaryCard key={i} data={m.stageData} onShowSolutions={handleShowSolutions} />;
              if (m.stageType === "solutions") return <SolutionsCard key={i} data={m.stageData} onReset={onReset} />;
            }
            return null;
          })}
        </div>
      </div>
      {(stage === "initial" || stage === "clarify") && (
        <div style={{ padding:"14px 24px 22px", borderTop:"1px solid var(--rule-light)", background:"var(--paper)", flexShrink:0 }}>
          <div style={{ maxWidth:700, margin:"0 auto" }}>
            <ChatInput
              onSubmit={handleUserResponse}
              placeholder={stage === "initial" ? "Svara på frågorna ovan…" : "Fortsätt resonera, eller skriv 'visa sammanfattning'…"}
            />
          </div>
        </div>
      )}
    </div>
  );
}
/* ─────────────────────────────────────────────
   APP ROOT
   ───────────────────────────────────────────── */
export default function App() {
  const [view, setView] = useState("landing");
  const [problem, setProblem] = useState("");
  const handleStart = (text) => { setProblem(text); setView("analysis"); };
  const handleReset = () => { setProblem(""); setView("landing"); };
  return (
    <>
      <style>{CSS}</style>
      {view === "landing" ? <LandingPage onStart={handleStart} /> : <AnalysisView problem={problem} onReset={handleReset} />}
    </>
  );
}
