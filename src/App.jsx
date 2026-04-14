import { useState, useEffect, useRef } from "react";
import { getMockInitial, getMockClarify, getMockSummary, getMockSolutions } from "./lib/mockAnalysis";
import "./styles/theme.css";

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
    <div style={{ fontFamily: "var(--sans)", color: "var(--ink)", background: "var(--paper)", minHeight: "100vh" }}>
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
      await new Promise(r => setTimeout(r, 900));
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
    <div style={{ fontFamily: "var(--sans)", color: "var(--ink)", background: "var(--paper)", display:"flex", flexDirection:"column", height:"100vh" }}>
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
      {view === "landing" ? <LandingPage onStart={handleStart} /> : <AnalysisView problem={problem} onReset={handleReset} />}
    </>
  );
}
