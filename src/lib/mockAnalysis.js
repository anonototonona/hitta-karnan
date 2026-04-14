/**
 * Mock Analysis Engine
 * Innehåller all mockad AI-logik för de 4 stegen
 */

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export function detectCategory(text) {
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

export async function getMockInitial(text) {
  const cat = detectCategory(text);
  await delay(2400);
  return { stage: "initial", category: cat, ...MOCK[cat].initial };
}

export async function getMockClarify(cat) {
  await delay(1800);
  return { stage: "clarify", questions: MOCK[cat].clarify };
}

export async function getMockSummary(cat) {
  await delay(2000);
  return { stage: "summary", ...MOCK[cat].summary };
}

export async function getMockSolutions(cat) {
  await delay(1500);
  return { stage: "solutions", solutions: MOCK[cat].solutions };
}
