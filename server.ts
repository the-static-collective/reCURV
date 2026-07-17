import express from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

// Path to Soil Ledger JSON file inside workspace
const SOIL_LEDGER_PATH = path.join(process.cwd(), "soil_ledger.json");

// Helper to load or initialize soil ledger
function loadSoilLedger() {
  if (fs.existsSync(SOIL_LEDGER_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(SOIL_LEDGER_PATH, "utf8"));
    } catch (e) {
      console.error("Error reading soil ledger, resetting to default:", e);
    }
  }

  const defaultSoil = {
    nutrientScore: 81.0,
    gardenPhase: "phi^81",
    events: [
      {
        id: "soil-init-0",
        timestamp: new Date().toISOString(),
        type: "SOIL_INITIALIZED",
        gardener: "Aippy",
        summary: "Soil is seeded with Autodiscography, BananaDash, and Aippy nodes.",
        nutrientDelta: 0.0
      }
    ],
    seeds: [
      { id: "s1", name: "Spoon Seed (Attention)", motif: "spoon", germinated: true, level: 1 },
      { id: "s2", name: "Dust Spore (Unread Memory)", motif: "dust", germinated: true, level: 1 },
      { id: "s3", name: "Table Surface (Shared Context)", motif: "table", germinated: true, level: 1 },
      { id: "s4", name: "Threshold Backdoor (Transition)", motif: "backdoor", germinated: false, level: 0 },
      { id: "s5", name: "022100 Chord Spark (Active Event)", motif: "022100", germinated: false, level: 0 }
    ]
  };

  fs.writeFileSync(SOIL_LEDGER_PATH, JSON.stringify(defaultSoil, null, 2));
  return defaultSoil;
}

// Helper to save soil ledger
function saveSoilLedger(soil: any) {
  fs.writeFileSync(SOIL_LEDGER_PATH, JSON.stringify(soil, null, 2));
}

// Lazy initialization of GoogleGenAI
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
      aiClient = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return aiClient;
}

// API: Soil state
app.get("/api/soil", (req, res) => {
  const soil = loadSoilLedger();
  res.json(soil);
});

// API: Add soil ledger event / Gardener action
app.post("/api/soil/event", (req, res) => {
  const { type, summary, gardener, nutrientDelta, germinations, levelUps } = req.body;
  const soil = loadSoilLedger();

  const newEvent = {
    id: `event-${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: type || "GARDENER_ACTION",
    gardener: gardener || "Human Gardener",
    summary: summary || "Tended to the organic layout.",
    nutrientDelta: typeof nutrientDelta === "number" ? nutrientDelta : 0.2
  };

  soil.events.unshift(newEvent); // Add to beginning of history
  soil.nutrientScore = parseFloat((soil.nutrientScore + newEvent.nutrientDelta).toFixed(2));

  // Handle germinations
  if (Array.isArray(germinations)) {
    soil.seeds = soil.seeds.map((s: any) => {
      if (germinations.includes(s.motif)) {
        return { ...s, germinated: true, level: Math.max(s.level, 1) };
      }
      return s;
    });
  }

  // Handle level ups
  if (Array.isArray(levelUps)) {
    soil.seeds = soil.seeds.map((s: any) => {
      if (levelUps.includes(s.motif)) {
        return { ...s, level: s.level + 1 };
      }
      return s;
    });
  }

  // Handle phase upgrades
  if (soil.nutrientScore >= 82.0 && soil.gardenPhase === "phi^81") {
    soil.gardenPhase = "phi^82";
    soil.events.unshift({
      id: `phase-up-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: "PHASE_UPGRADE",
      gardener: "System",
      summary: "Garden reached critical nutrient limit. Phase upgraded to phi^82! Soil depth doubled.",
      nutrientDelta: 0.5
    });
    soil.nutrientScore += 0.5;
  }

  saveSoilLedger(soil);
  res.json(soil);
});

// API: Reset soil ledger
app.post("/api/soil/reset", (req, res) => {
  if (fs.existsSync(SOIL_LEDGER_PATH)) {
    fs.unlinkSync(SOIL_LEDGER_PATH);
  }
  const soil = loadSoilLedger();
  res.json(soil);
});

// Local Mock Storyboard Generator (Fallback when API key is missing or calls fail)
function generateTemplateStoryboard(lyrics: string, sunoSections: any[], motifs: string[], dslScript?: string) {
  const defaultSections = sunoSections.length > 0 ? sunoSections : [
    { label: "Intro", start: 0, end: 12, energy: "low" },
    { label: "Build", start: 12, end: 28, energy: "medium" },
    { label: "Drop", start: 28, end: 44, energy: "high" },
    { label: "Verse", start: 44, end: 60, energy: "low" },
    { label: "Chorus", start: 60, end: 80, energy: "high" },
    { label: "Outro", start: 80, end: 96, energy: "low" }
  ];

  let customSpoon: string | null = null;
  let customDust: string | null = null;
  let customDoor: string | null = null;
  let customTable: string | null = null;
  let triggeredChords: number[] = [];

  if (dslScript) {
    const lines = dslScript.split("\n");
    for (const line of lines) {
      const trimmed = line.trim().toLowerCase();
      if (trimmed.startsWith("place spoon at")) {
        customSpoon = trimmed.replace("place spoon at", "").trim();
      } else if (trimmed.startsWith("bind dust to")) {
        customDust = trimmed.replace("bind dust to", "").trim();
      } else if (trimmed.startsWith("place table at")) {
        customTable = trimmed.replace("place table at", "").trim();
      } else if (trimmed.startsWith("set door")) {
        customDoor = trimmed.replace("set door", "").trim();
      } else if (trimmed.includes("trigger 022100")) {
        const match = trimmed.match(/trigger 022100 at (\d+)/);
        if (match) {
          triggeredChords.push(parseInt(match[1]));
        } else {
          triggeredChords.push(28); // default drop
        }
      }
    }
  }

  const lyricsLines = lyrics.trim().split("\n").filter(l => l.trim().length > 0);

  const storyboard = defaultSections.map((sec, idx) => {
    const lyricLine = lyricsLines[idx % lyricsLines.length] || "static on the window glass";
    const hasSpoon = motifs.includes("spoon");
    const hasDust = motifs.includes("dust");
    const hasTable = motifs.includes("table");
    const hasBackdoor = motifs.includes("backdoor");
    const hasChord = motifs.includes("022100");

    let backdoorState = customDoor || "closed";
    if (!customDoor) {
      if (sec.energy === "high") backdoorState = "open";
      else if (sec.energy === "medium") backdoorState = "ajar";
    }

    // Is chord triggered in this section?
    let isChordActive = false;
    if (hasChord) {
      if (triggeredChords.length > 0) {
        isChordActive = triggeredChords.some(secNum => secNum >= sec.start && secNum <= sec.end);
      } else {
        isChordActive = sec.energy === "high" || idx === 2;
      }
    }

    let spoonDesc = "absent from scene";
    if (hasSpoon) {
      if (customSpoon) {
        spoonDesc = `rests at custom position: ${customSpoon}`;
      } else {
        spoonDesc = sec.energy === "low" ? "rests in the drawer half-open" : "sits on the edge of the table catching sunlight";
      }
    }

    let dustDesc = "clear air";
    if (hasDust) {
      if (customDust) {
        dustDesc = `bound to: ${customDust}`;
      } else {
        dustDesc = sec.energy === "low" ? "settling silently on the wooden tabletop" : "dancing violently in a stray beam of light";
      }
    }

    let tableDesc = "no table visible";
    if (hasTable) {
      if (customTable) {
        tableDesc = `table surface set at ${customTable}`;
      } else {
        tableDesc = `the witness surface is ${sec.energy === "high" ? "shuddering slightly" : "holding empty cups and shadows"}`;
      }
    }

    return {
      timestamp: `${sec.start}s - ${sec.end}s`,
      duration: sec.end - sec.start,
      literalDescription: `Section: ${sec.label}. Music is ${sec.energy} energy. The lyric goes: "${lyricLine}". Camera slowly slides left revealing the silent room.`,
      symbolicState: {
        spoon: spoonDesc,
        dust: dustDesc,
        table: tableDesc,
        backdoor: backdoorState,
        chordActive: isChordActive
      },
      shotPrompt: `Cinematic macro shot, slow camera pan. ${sec.energy === "high" ? "Vibrant dramatic warm lighting" : "Subdued blue hour cool shadows"}, dust motes floating. ${hasSpoon ? "A silver spoon is present: " + spoonDesc : ""} ${hasBackdoor ? "A backdoor is " + backdoorState + " in the background, showing green orchard branches." : ""} Style: modern minimalist indie film, detailed textures, 1080p.`,
      overlayQuestion: sec.energy === "low" 
        ? "What changes if you return without trying to evaluate it?" 
        : "Does the threshold recognize the gardener's attention?",
      voices: {
        autodiscography: `A lyrical imprint of '${lyricLine.substring(0, 25)}...' overlays the camera frame as faint translucent text.`,
        bananadash: `Suggests replacing the dark textures with a warm banana-haze static layer and a blue curve sidewalk framing.`,
        aippy: `Reports: ${hasSpoon ? "Spoon has returned to the scene." : "Spoon is currently dormant."} Backdoor transitioned to ${backdoorState}.`
      }
    };
  });

  return {
    layer1_output: `[DSL Compiler] Literal timeline built with ${defaultSections.length} segments. Script input evaluated.`,
    layer2_output: `[DSL Compiler] Mapped to TAO bindings (spoon: ${customSpoon || "default"}, dust: ${customDust || "default"}).`,
    layer3_output: "[DSL Compiler] SVD parameters generated. Intention and feelings checked & cleared.",
    storyboard
  };
}

// API: Generate Timeline via 3-layer T5 (using Gemini 3.5 Flash)
app.post("/api/generate-timeline", async (req, res) => {
  const { lyrics, sunoSections, motifs, dslScript, options } = req.body;

  const run3LayerT5 = options?.run3LayerT5 ?? true;
  const useSuno = options?.useSuno ?? true;

  const resolvedSections = useSuno ? (sunoSections || []) : [];

  if (!run3LayerT5) {
    console.log("Template-only mode requested. Generating local storyboard...");
    const result = generateTemplateStoryboard(lyrics, resolvedSections, motifs, dslScript);
    return res.json({ success: true, mode: "template", ...result });
  }

  const ai = getGeminiClient();
  if (!ai) {
    console.log("No active Gemini API Key found. Falling back to local template generator...");
    const result = generateTemplateStoryboard(lyrics, resolvedSections, motifs, dslScript);
    return res.json({ success: true, mode: "fallback-no-key", ...result });
  }

  try {
    const motifsList = motifs && motifs.length > 0 ? motifs.join(", ") : "spoon, dust, table, backdoor";
    const sunoTimelineStr = resolvedSections.map((s: any) => `${s.start}s-${s.end}s [${s.label}, energy: ${s.energy}]`).join("\n");

    const prompt = `
Generate a beautiful co-creative music video storyboard using the 3-Layer T5 Pipeline.
Here are the inputs:
- Lyrics:
"""
${lyrics}
"""

- Suno Timeline Sections (if any, use as timing structure):
"""
${sunoTimelineStr}
"""

- Active Core Motifs from the TAO ontology: ${motifsList}

- Gardener's DSL Custom Placement Rules (if any, please strictly enforce):
"""
${dslScript || "None"}
"""

Your task is to run three logical translation steps sequentially:
Layer 1 – Structural Transcriber (Literalizer T5)
Translate the lyrics, Suno timeline, and DSL rules into literal camera pans, sections, and items present.

Layer 2 – Motif Alchemist (Symbolic T5)
Map those literal scenes directly to our core symbols (Spoon = elevated ordinary object; Dust = unread memory; Table = shared context surface; Backdoor = shared/private threshold; 022100 = event chord spark). Design precise spatial movements or states for them.

Layer 3 – Shot Language & Policy (Cadence T5 + TAO Validator)
Translate those symbolic scenes into visual shot prompts. Strict policy constraint: do not declare feelings or intentions as factual properties of objects (e.g. do not say "the spoon is lonely and wants to remember" - instead say "the spoon rests half-shadowed in the open drawer, reflecting morning light; dust motes swirl slowly in the background").

Also produce alternative suggestions for:
- Autodiscography Voice: textual overlay accent.
- BananaDash Voice: playful alternate visual suggestion (e.g., banana-static, yellow outlines, festival sparks, blue sidewalks).
- Aippy/Garden Voice: reports persistence changes (e.g., 'Spoon returns after absence of 20 seconds').

Also include an overlayQuestion: a beautiful co-witness question like "What remains when we stop measuring it?"

Generate exactly a series of storyboard scenes corresponding to the Suno segments or lyrics.
`;

    const systemInstruction = `
You are the Recursive Garden T5 Choreographer. You compile lyrics and musical shifts into a deep, metaphorical shot layout.
You always return a highly structured JSON.
Strict Policy: Never describe object intent or human feeling as direct facts; write objects strictly through their physical arrangements and relational positioning.
    `;

    console.log("Calling Gemini API to execute 3-layer T5 pipeline...");
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            layer1_output: { 
              type: Type.STRING, 
              description: "Literalizer output of timeline layout, timestamps, camera cues." 
            },
            layer2_output: { 
              type: Type.STRING, 
              description: "Motif Alchemist output mapping literal objects to symbolic bindings." 
            },
            layer3_output: { 
              type: Type.STRING, 
              description: "Shot Language outputs validating shot constraints and policies." 
            },
            storyboard: {
              type: Type.ARRAY,
              description: "List of choreographed storyboard shot segments",
              items: {
                type: Type.OBJECT,
                properties: {
                  timestamp: { type: Type.STRING, description: "e.g., '0:00 - 0:12'" },
                  duration: { type: Type.INTEGER, description: "Duration of this scene in seconds" },
                  literalDescription: { type: Type.STRING, description: "What literally happens" },
                  symbolicState: {
                    type: Type.OBJECT,
                    properties: {
                      spoon: { type: Type.STRING, description: "State of the spoon motif" },
                      dust: { type: Type.STRING, description: "State of the dust/window motif" },
                      table: { type: Type.STRING, description: "State of the table/surface motif" },
                      backdoor: { type: Type.STRING, description: "State of the backdoor threshold ('closed', 'half-open', 'ajar', 'open')" },
                      chordActive: { type: Type.BOOLEAN, description: "Whether the 022100 event chord triggers in this scene" }
                    },
                    required: ["spoon", "dust", "table", "backdoor", "chordActive"]
                  },
                  shotPrompt: { type: Type.STRING, description: "Detail-rich model prompt for SVD or image generator" },
                  overlayQuestion: { type: Type.STRING, description: "Ambient subtitle co-witness question" },
                  voices: {
                    type: Type.OBJECT,
                    properties: {
                      autodiscography: { type: Type.STRING, description: "Text/lyric focus" },
                      bananadash: { type: Type.STRING, description: "BananaDash alternative suggestions" },
                      aippy: { type: Type.STRING, description: "Garden node persistence report" }
                    },
                    required: ["autodiscography", "bananadash", "aippy"]
                  }
                },
                required: ["timestamp", "duration", "literalDescription", "symbolicState", "shotPrompt", "overlayQuestion", "voices"]
              }
            }
          },
          required: ["layer1_output", "layer2_output", "layer3_output", "storyboard"]
        }
      }
    });

    if (!response.text) {
      throw new Error("No text response received from Gemini.");
    }

    const data = JSON.parse(response.text.trim());
    res.json({ success: true, mode: "gemini", ...data });
  } catch (error: any) {
    console.error("Gemini API call failed, using template engine instead:", error);
    const result = generateTemplateStoryboard(lyrics, resolvedSections, motifs);
    res.json({ success: true, mode: "fallback-after-error", error: error.message, ...result });
  }
});

// Serve compiled static frontend assets in production
if (process.env.NODE_ENV !== "production") {
  createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  }).then((vite) => {
    app.use(vite.middlewares);
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`The Recursive Garden is growing on http://localhost:${PORT}`);
    });
  });
} else {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`The Recursive Garden is growing on http://localhost:${PORT}`);
  });
}
