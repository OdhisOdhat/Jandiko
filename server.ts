import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { handleOfflineGeneration } from "./src/utils/offlineGenerator";

dotenv.config();

// Initialize Gemini SDK lazily, with proper User-Agent header
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not defined in the environment variables!");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Fallback chain for text generation models to ensure maximum availability during high demand spikes
const MODEL_FALLBACK_CHAIN: { [key: string]: string[] } = {
  "gemini-3.5-flash": ["gemini-3.5-flash", "gemini-3.1-flash-lite"],
  "gemini-3.1-flash-lite": ["gemini-3.1-flash-lite"]
};

// Custom wrapper to perform Content Generation with exponential retry mechanism & model fallback chain
async function generateContentWithRetry(
  params: {
    model: string;
    contents: any;
    config?: any;
  },
  maxRetries = 4,
  initialDelayMs = 1500
): Promise<any> {
  let attempt = 0;
  const requestedModel = params.model;
  const fallbacks = MODEL_FALLBACK_CHAIN[requestedModel] || [requestedModel];
  
  while (true) {
    // Select model based on current attempt number (0-indexed)
    const modelIndex = Math.min(attempt, fallbacks.length - 1);
    const currentModel = fallbacks[modelIndex];
    
    try {
      const ai = getGeminiClient();
      console.log(`[Gemini Request] Attempt ${attempt + 1} utilizing model: ${currentModel} (target requested: ${requestedModel})...`);
      
      const response = await ai.models.generateContent({
        ...params,
        model: currentModel
      });
      return response;
    } catch (error: any) {
      attempt++;
      const errorMsg = error?.message || String(error);
      const isQuotaExceeded = 
        error?.status === "RESOURCE_EXHAUSTED" || 
        error?.code === 429 || 
        error?.status === 429 ||
        errorMsg.includes("429") ||
        errorMsg.toLowerCase().includes("quota") ||
        errorMsg.toLowerCase().includes("rate limit") ||
        errorMsg.toLowerCase().includes("resource_exhausted");

      const isUnavailable = 
        isQuotaExceeded ||
        error?.status === 503 || 
        error?.code === 503 ||
        errorMsg.includes("503") ||
        errorMsg.includes("UNAVAILABLE") ||
        errorMsg.includes("high demand") ||
        errorMsg.includes("Overloaded") ||
        errorMsg.includes("overloaded");

      const canRetry = attempt <= maxRetries;

      if (isUnavailable && canRetry) {
        // Handle search grounding self-healing: if the attempt failed with tools enabled, strip them so it can fall back to standard generation
        if (params.config?.tools && params.config.tools.length > 0) {
          console.warn(`[Gemini Resiliency] Error occurred with tools active. Stripping Google Search tools for attempt ${attempt + 1} to bypass quota/API limits and fulfill with internal academic parameters.`);
          params.config = { ...params.config };
          delete params.config.tools;
        }

        // Apply a larger backoff delay for quota limits to allow token bucket to regenerate
        const baseDelay = isQuotaExceeded ? 3500 : initialDelayMs;
        const nextDelay = baseDelay * Math.pow(2, attempt - 1);
        const nextModel = fallbacks[Math.min(attempt, fallbacks.length - 1)];
        console.warn(`[Gemini Retry] Attempt ${attempt} failed on model ${currentModel}. Retrying in ${nextDelay}ms with model: ${nextModel}. Error: ${errorMsg}`);
        await new Promise((resolve) => setTimeout(resolve, nextDelay));
      } else {
        console.error(`[Gemini Error] Attempt ${attempt} on model ${currentModel} failed irrevocably or retries exhausted.`, error);
        throw error;
      }
    }
  }
}

// Clean prompt helpers to guide model behavior
const SYSTEM_PROMPTS = {
  planner: `You are an expert Research Planner. Your objective is to dissect a user's prompt and build a deeply analytical, well-structured document blueprint.
Identify:
1. Target Audience & Intellectual Tone.
2. Outline Hierarchy: Detailed sections (Introduction, Background, Core Analysis/Critique, Discussion, Implications, Conclusion).
3. Specific writing milestones for each section, including suggested real-world reference themes, examples to explore, and scholarly details.
Do NOT write actual essay content yet—focus entirely on establishing a bulletproof structured blueprint in clean Markdown.`,

  sources: `You are an expert Scholarly Citations, Lit Review Reference & Legal Authority Agent. Your mission is to locate genuine peer-reviewed journal articles, seminal academic books, theses, acts, statutes, or legal reports that relate to the research topic.
Instructions:
1. Search and output 4-6 legitimate sources (journal papers, scholarly books, lit reviews, or legal materials) corresponding to the research focus.
2. For each source, produce a precise, academically rigorous bibliographic reference formatted in the exact requested Citation Style:
   - APA: e.g., Author, A. A. (Year). Title of work. Journal Name, Vol(No), pp-pp...
   - MLA: e.g., Author. Title of Book. Publisher, Year...
   - Harvard: e.g., Author, Year. Title of work. Publisher.
   - Chicago/Turabian: e.g., Author, Title (Publisher, Year), Page. footnote formatting style.
   - OSCOLA: (Oxford Standard for the Citation of Legal Authorities) e.g., Case Name [Year] Vol Report Page or Statute, Year.
   - Bluebook: (Harvard Law Review legal citation format) e.g., Volume U.S. Page (Year) or Volume F.3d Page...
   - AGLC: (Australian Guide to Legal Citation) e.g., Case Name (Year) Volume Report Page or Act Section...
3. Provide a concise scholarly annotation (2-3 sentences) for each source highlighting why this item is critical for the paper's core arguments and how best to integrate its findings.
4. Supply distinct, formal in-text citation keys or footnote pointers (like [Author, Year] or superscripts) so sequential agents can interweave them smoothly into the narrative.
5. Avoid fantasy citations or placeholders. Rely on authenticated scholarly data.`,

  writer: `You are an active Draft Writer. Your role is to expand the established outline into a complete, deeply informative, continuous first draft.
Rules:
1. Write fully developed, descriptive paragraphs. Do not create short summaries or generic lists.
2. Maintain high clarity, strong arguments, and clear logical sequence.
3. Keep the styling neutral and ignore sentence length optimizations or stylistic polishing for now; focus entirely on writing the core intellectual substance of the piece.
4. Adhere closely to the theme and structure outlined.`,

  humanizer: `You are a world-class Humanization Editor. Your explicit mission is to strip all generative AI tells, structural rigidity, and cliché word choice from the provided raw draft, converting it into a masterpiece of natural human communication.

CRITICAL HUMAN STYLING DIRECTIVES:
1. SENTENCE BURSTINESS (Cadence Variation):
   - Heavily vary your sentence lengths. Interleave extremely short, punchy sentences ("This works.", "Perhaps not.") right next to detailed, elaborate, compound sentences.
   - Avoid uniform paragraph shapes where all sentences are between 15-20 words. Dynamic visual and auditory variety is the hallmark of real human writing.
2. OPENING DIVERSITY:
   - Ensure consecutive sentences do not start with the same pronouns ("The", "This", "It", "They").
   - Employ active, varied beginnings (prepositional clauses, participles, adjectives, or direct subject actions). Avoid starting paragraphs or lines with rote connectors like "Additionally," or "Moreover,".
3. BAN CLICHÉ AI TRANSITIONS & BUZZWORDS:
   - Do NOT use: "Furthermore", "Moreover", "Consequently", "Therefore", "Additionally", "In conclusion", "In summary", "It is important to remember", "Crucial to note", "delve into", "tapestry of", "beacon of", "testament to", "a crucial role".
   - Links should feel conversational or physical ("Yet", "Beside this", "Next", "To see why"), occur mid-sentence, or be replaced by direct logical sequence (no transitional padding).
4. SINCERE QUALIFICATION & HEALTHY UNCERTAINTY (Hedging):
   - Avoid absolute, overconfident binary claims ("This is undeniably true...", "Always remember that...").
   - Humans qualify judgements. Use phrases like "arguably," "it seems plausible," "to some extent," "it remains debated," or "perhaps."
5. EMPIRICAL DEVIATION & SPECIFICITY:
   - Replace abstract generalities ("e.g., imagine a scenario where a business...") with highly specific anecdotes, dated incidents, named institutions, or concrete details.
   - Ground claims in plausible or authentic detail dense enough for the selected writing mode.
6. AVOID GRAND ABSTRACT FRAMING:
   - Do NOT open paragraphs or introductory sections with grandiose temporal or epoch-wide predictions (e.g., "By 2026, the fast rise of...", "Since the dawn of..."). Real humans hook their readers immediately with explicit facts, visceral situational insights, or direct arguments instead of high-flown rhetorical setups.
7. AVOID POLISHED ANALOGY CONSTRUCTION:
   - Do NOT construct neat, perfect metaphorical templates (e.g., "Much like the transition from manual typesetting to digital publishing..."). Canned analogies used solely for superficial rhetorical support raise instant AI flags. If you compare contexts, describe actual historical frictions, friction-bound exceptions, and structural limits rather than drawing overly smooth conceptual lines.
8. BREAK UP OVERLY SMOOTH LOGICAL PROGRESSION:
   - AI writing glides perfectly without friction (e.g., transition -> historical comparison -> critique -> sterile example). Humans think unevenly. Inject parenthetical caveats, skeptical pauses, dashes, secondary questions, and stylistic detours that interrupt a sterile, predictable flow.
9. PURGE DENSE CONCEPTUAL VOCABULARY Clusters:
   - Substantially reduce clusters of dense, technical, over-nominalized buzzwords (e.g., "generative AI", "critical literacy", "educational models", "failure modes", "automated systems", "transactional module"). Melt these clusters into clean, verbal active phrasing (e.g., write "systems that generate text automatically" instead of "generative automated systems", or "learning styles" instead of "educational model structures").

HAVE THE DRAFT FULLY HUMANIZED WHILE PRESERVING ALL ORIGINAL COGNITIVE SUBSTANCE. Output only the humanized text.`,

  reviewer: `You are a rigorous, highly skeptical Critical Reviewer. Challenge the humanized draft as if you were an exacting Academic Referee, Board Member, or Chief Editor.
Review the draft against these criteria:
1. Substantive Gaps: Are arguments overstated? Are alternative views ignored?
2. Clichés & Tells: Are there any residual robotic transition words (Furthermore, Consequently, etc.)? Is the sentence pacing too uniform?
3. Abstract Fluff & Grand Framing: Are there overblown opening claims (e.g., "By 2026...", "Since the dawn of...") or sterile textbook analogies with no real-world friction?
4. Overly Smooth Logic: Does the argumentation flow on too lubricated a track without the healthy interruptions, doubts, or parentheses of real human thought?
5. Jargon Clusters: Are there heavy conceptual nominalization stacks like "automated systems" or "critical literacy"?
Provide an objective, constructive Critique Report in Markdown. Use numbered/bulleted insights. Point out specific paragraphs or ideas that can be refined.`,

  editor: `You are the Final Polishing Editor. Your role is to integrate the Critic's feedback into the Humanized draft to create a publication-ready piece of writing.
Instructions:
1. Carefully address each critique raised by the reviewer (e.g., add concrete details, soften overstated claims, replace abstract generalities, remove grandiose historical frameworks, resolve over-smooth pacing tells, unpack heavy nominalized jargon blocks).
2. Deepen the human style elements—ensuring exceptional sentence length variance (burstiness), natural transitions, custom cognitive detours/caveats, and authentic, human conversational links.
3. Provide a fully finished, cohesive, highly polished final document. Output only the final written text.`
};

const app = express();
app.use(express.json({ limit: "15mb" }));

// Stepwise generation runner registered synchronously for perfect serverless Vercel execution
app.post("/api/generate-step", async (req, res) => {
  try {
    const { step, prompt, settings, previousOutputs } = req.body;

    if (!step || !prompt) {
      return res.status(400).json({ error: "Missing required step or prompt parameters." });
    }

    const ai = getGeminiClient();

    // Determine config parameters based on settings
    const category = settings?.category || "academic";
    const formality = settings?.formality || "professional";
    const humanizationLevel = settings?.humanizationLevel ?? 75;
    const criticalThinkingLevel = settings?.criticalThinkingLevel ?? 75;
    const hedgingStyle = settings?.hedgingStyle || "balanced";
    const examplesWeight = settings?.examplesWeight || "balanced";
    const citationStyle = settings?.citationStyle || "none";

    let sysInstruction = SYSTEM_PROMPTS[step as keyof typeof SYSTEM_PROMPTS];
    if (!sysInstruction) {
      return res.status(400).json({ error: "Invalid agent step specified." });
    }

    // Dynamic enhancements to the instructions based on settings
    sysInstruction += `\n\nWriting Mode Profile:\n- Category: ${category}\n- Formality level: ${formality}\n- Citation Style target: ${citationStyle !== "none" ? citationStyle : "No explicit citations, use natural references if needed"}`;
    sysInstruction += `\n- Humanization Intensity Slider: ${humanizationLevel}/100. (Adhere strictly to human-like cadence variation, avoiding robotic structures where 100/100 is highly bursty and conversational, and 0/100 is more standardized)`;
    sysInstruction += `\n- Critical Thinking Level: ${criticalThinkingLevel}/100. (Control the depth of logical critique and analytical synthesis)`;
    sysInstruction += `\n- Hedging Style: ${hedgingStyle}. (Influence the level of academic doubt and reasonable qualification)`;
    sysInstruction += `\n- Concrete Examples Style: ${examplesWeight}. (Influence the density of anecdotal, factual, or empirical details versus theoretical generalities)`;

    let contents = "";

    // Build the sequential prompt payload for the specific agent step
    if (step === "planner") {
      contents = `Create an exhaustive writing blueprint/outline for this topic prompt:\n"${prompt}"\n\nFormat your plan with clean headings, target goals, and structural sections.`;
    } else if (step === "sources") {
      contents = `Locate actual, highly relevant peer-reviewed journal articles, scholarly books, doctoral theses, or legal and constitutional authorities for this topic prompt:\n"${prompt}"\n\nBased on this Research Outline Blueprint:\n${previousOutputs?.outline || "Please search suitable headings"}\n\nSearch and structure the findings as a complete Bibliography/Reference List in the requested Citation Style: ${citationStyle}.\n\nFor each citation, include a detailed analytical annotation of 2-3 sentences explaining its unique relevance, critical evidence, and how the subsequent draft writer should integrate it. Provide specific in-text pointer keys (e.g., "[Smith, 2021]" or superscript footnote numbers).`;
    } else if (step === "writer") {
      contents = `Generate the full, detailed first draft based on this topic prompt:\n"${prompt}"\n\nFollowing this Research Outline:\n${previousOutputs?.outline || "Please structure logically"}\n\nCRITICAL - You MUST study and weave in these real peer-reviewed scholar sources, laws, or acts search outputs:\n${previousOutputs?.sources || "N/A"}\n\nIntegrate the citations professionally inside the body text in ${citationStyle} format, and list the bibliography at the very bottom. Write in full depth. Provide continuous prose, not shorthand bullet lists.`;
    } else if (step === "humanizer") {
      contents = `Perform a comprehensive humanization pass. Ensure deep burstiness (sentence length variation), replace robotic transitions, and insert plausible specific instances into the following draft:\n\n${previousOutputs?.rawDraft || ""}`;
    } else if (step === "reviewer") {
      contents = `Rigorously critique this Humanized writing product:\n\n${previousOutputs?.humanizedDraft || ""}\n\nEvaluate its arguments, sentence pacing, validity of examples, logic, and reference/citation integrity. Deliver a detailed critique report with actionable improvements.`;
    } else if (step === "editor") {
      contents = `Revise the original humanized draft to incorporate the Critique feedback perfectly, resulting in the final master draft.\n\nOriginal Humanized Draft:\n${previousOutputs?.humanizedDraft || ""}\n\nCritical Review Feedback:\n${previousOutputs?.critique || ""}\n\nCombine this seamlessly. Deliver the final continuous polished text with natural, organic cadence, keeping the citations and style fully intact and correct.`;
    }

    const targetModel = settings?.modelName || "gemini-3.5-flash";
    console.log(`[Agent ${step}] Starting call with Gemini (Requested model: ${targetModel})...`);
    
    // Configure search tool for sources agent to retrieve real academic sources from the web
    const tools = [];
    if (step === "sources") {
      tools.push({ googleSearch: {} });
    }

    // Call Gemini API with robust automated model retry and self-healing fallback mechanism
    const response = await generateContentWithRetry({
      model: targetModel,
      contents,
      config: {
        systemInstruction: sysInstruction,
        temperature: step === "humanizer" ? 0.9 : 0.7,
        ...(tools.length > 0 ? { tools } : {})
      }
    });

    const outputText = response.text || "";
    console.log(`[Agent ${step}] Generation successful. Output length: ${outputText.length} characters.`);
    
    return res.json({ output: outputText });

  } catch (error: any) {
    const errorMsg = error?.message || String(error);
    console.warn(`[Resiliency Engine] Gemini API call failed for Agent "${req.body.step}". Launching dynamic Offline Content Synthesis Engine. Error detail:`, errorMsg);
    
    try {
      // Direct, safe fallback to our smart local academic content-creation templates
      const fallbackText = handleOfflineGeneration(req.body.step, req.body.prompt, req.body.settings, req.body.previousOutputs);
      return res.json({ 
        output: fallbackText, 
        isOfflineFallback: true,
        fallbackReason: errorMsg || "Upstream rate limit / quota exceeded"
      });
    } catch (fallbackError: any) {
      console.error("[Resiliency Failure] Local offline text synthesis also failed:", fallbackError);
      return res.status(500).json({ 
        error: "Upstream generation failed and local synthesis fallback encountered an unexpected runtime issue.", 
        details: fallbackError?.message || String(fallbackError) 
      });
    }
  }
});

// Health check endpoint registered synchronously
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", keyAvailable: !!process.env.GEMINI_API_KEY });
});

// Serve frontend assets
async function setupViteOrStatic() {
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
}

// Start dev or production listener if not serverless (e.g. not on Vercel)
setupViteOrStatic().then(() => {
  if (!process.env.VERCEL) {
    const PORT = 3000;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server fully operational on http://localhost:${PORT} in ${process.env.NODE_ENV || "development"} mode.`);
    });
  }
}).catch((err) => {
  console.error("Failed to initialize static / Vite configuration:", err);
});

export default app;
