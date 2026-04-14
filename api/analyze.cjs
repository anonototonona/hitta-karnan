/**
 * Vercel Serverless Function: Claude API Integration
 *
 * This function receives a problem from the frontend and returns
 * analysis from Claude API instead of using mock data.
 *
 * Path: /api/analyze
 * Method: POST
 * Body: { problem: string, stage: "initial" | "clarify" | "summary" | "solutions" }
 */

const Anthropic = require("@anthropic-ai/sdk").default;

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

module.exports = async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { problem, stage } = req.body;

  // Validate input
  if (!problem || !stage) {
    return res.status(400).json({ error: "Missing problem or stage" });
  }

  try {
    // Build system and user prompts based on stage
    const systemPrompt = buildSystemPrompt(stage);
    const userPrompt = buildUserPrompt(problem, stage);

    // Call Claude API
    const message = await client.messages.create({
      model: "claude-3-5-sonnet-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
      system: systemPrompt,
    });

    // Extract text response
    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Parse JSON response from Claude
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseText);
    } catch (e) {
      // If Claude didn't return valid JSON, wrap it
      parsedResponse = { response: responseText };
    }

    // Return success response
    res.status(200).json({
      success: true,
      stage: stage,
      data: parsedResponse,
    });
  } catch (error) {
    console.error("Claude API error:", error);

    // Handle specific error types
    if (error.status === 401) {
      return res.status(401).json({
        error: "Invalid API key",
        details: "Check ANTHROPIC_API_KEY environment variable",
      });
    }

    if (error.status === 429) {
      return res.status(429).json({
        error: "Rate limit exceeded",
        details: "Too many requests. Please wait a moment.",
      });
    }

    res.status(500).json({
      error: "Failed to analyze problem",
      details: error.message,
    });
  }
}

/**
 * Build system prompt based on analysis stage
 */
function buildSystemPrompt(stage) {
  const basePrompt = `Du är en expertanalytiker som hjälper användare förstå sitt problem innan lösningar föreslås.
Din roll är att:
1. Förstå vad användaren faktiskt frågar om
2. Skilja mellan symptom och grundorsak
3. Separera fakta från antaganden
4. Ställa djupgående frågor

Svara ALLTID på svenska. Svara med ENDAST valid JSON, ingen annan text.`;

  if (stage === "initial") {
    return `${basePrompt}

För denna fas ska du analysera användarens utgångsproblem och returnera JSON med denna EXAKTA struktur:
{
  "topic": "En kort beskrivning av vad problemet handlar om",
  "surfaceOrCore": "En analys av om det verkar vara ett symptom eller grundorsak",
  "questions": ["Fråga 1?", "Fråga 2?", "Fråga 3?"]
}`;
  }

  if (stage === "clarify") {
    return `${basePrompt}

För denna fas har användaren svarat på tidigare frågor. Din roll är att:
1. Gå djupare in i problemet baserat på deras svar
2. Ställa 1-2 nya fördjupningsfrågor
3. Röra dem närmare grundorsaken

Returnera JSON med denna EXAKTA struktur:
{
  "questions": ["Ny fråga 1?", "Ny fråga 2?"]
}`;
  }

  if (stage === "summary") {
    return `${basePrompt}

För denna fas ska du sammanfatta allt vi har diskuterat och identifiera:
1. Den verkliga grundorsaken
2. Fakta vs antaganden
3. Vad som driver problemet

Returnera JSON med denna EXAKTA struktur:
{
  "core": "En tydlig mening som sammanfattar grundproblemet",
  "facts": ["Faktum 1", "Faktum 2"],
  "assumptions": ["Antagande 1", "Antagande 2"],
  "drivers": "En beskrivning av vad som faktiskt driver problemet",
  "unclear": "Vad som fortfarande är oklart",
  "nextSteps": ["Möjligt nästa steg 1", "Möjligt nästa steg 2"]
}`;
  }

  if (stage === "solutions") {
    return `${basePrompt}

För denna fas ska du föreslå lösningar som ADRESSERAR GRUNDORSAKEN, inte bara symptomen.

Returnera JSON med denna EXAKTA struktur:
{
  "solutions": [
    {
      "title": "Lösning 1",
      "why": "Kort förklaring av varför detta matchar grundorsaken",
      "risk": "En möjlig risk eller begränsning med denna lösning"
    },
    {
      "title": "Lösning 2",
      "why": "Kort förklaring av varför detta matchar grundorsaken",
      "risk": "En möjlig risk eller begränsning med denna lösning"
    }
  ]
}`;
  }

  return basePrompt;
}

/**
 * Build user prompt based on stage and problem
 */
function buildUserPrompt(problem, stage) {
  if (stage === "initial") {
    return `Användarens problem: "${problem}"

Analysera detta problem och:
1. Identifiera vad det handlar om
2. Säg om det verkar vara ett symptom eller en grundorsak
3. Ställ 3 frågor som tar oss närmare grunden`;
  }

  if (stage === "clarify") {
    return `Användarens tidigare problem: "${problem}"

De har redan svarat på några frågor. Baserat på denna bakgrund:
1. Ställ 1-2 nya frågor som går djupare
2. Fokusera på att skilja symptom från grundorsak`;
  }

  if (stage === "summary") {
    return `Användarens problem: "${problem}"

Baserat på allt vi har diskuterat:
1. Sammanfatta vad grundproblemet verkar vara
2. Identifiera fakta vs antaganden
3. Beskriva vad som troligt driver problemet`;
  }

  if (stage === "solutions") {
    return `Användarens problem: "${problem}"

Nu när vi förstår grundproblemet:
1. Föreslå 2-3 lösningar som adresserar ORSAKEN, inte bara symptomen
2. Förklara varför varje lösning matchar grundorsaken
3. Nämn möjliga risker eller begränsningar`;
  }

  return problem;
}
