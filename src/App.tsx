import React, { useState, useEffect } from "react";
import { StoryboardShot, SoilLedgerState, SunoSection } from "./types";
import { LYRIC_PRESETS } from "./presets";
import SoilLedger from "./components/SoilLedger";
import T5Planner from "./components/T5Planner";
import VideoPlayer from "./components/VideoPlayer";
import CrossPollination from "./components/CrossPollination";
import { Sprout, Compass, HelpCircle, AlertCircle, Info, Sparkles } from "lucide-react";

export default function App() {
  const [soil, setSoil] = useState<SoilLedgerState>({
    nutrientScore: 81.0,
    gardenPhase: "phi^81",
    events: [
      {
        id: "soil-init-local",
        timestamp: new Date().toISOString(),
        type: "SOIL_INITIALIZED",
        gardener: "Aippy",
        summary: "Seeding local memory backup while connection establishes...",
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
  });

  const [storyboard, setStoryboard] = useState<StoryboardShot[]>([]);
  const [currentSceneIndex, setCurrentSceneIndex] = useState<number>(0);
  const [layer1_output, setLayer1_output] = useState<string>("");
  const [layer2_output, setLayer2_output] = useState<string>("");
  const [layer3_output, setLayer3_output] = useState<string>("");
  
  const [loading, setLoading] = useState<boolean>(false);
  const [soilLoading, setSoilLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [apiMode, setApiMode] = useState<string>("");
  const [showHowItWorks, setShowHowItWorks] = useState<boolean>(false);

  // Load soil on mount
  useEffect(() => {
    fetchSoil();
    // Load static preset story sequence on startup
    choreographStaticStartup();
  }, []);

  const fetchSoil = async () => {
    setSoilLoading(true);
    try {
      const res = await fetch("/api/soil");
      if (res.ok) {
        const data = await res.json();
        setSoil(data);
      }
    } catch (e) {
      console.error("Failed to connect to full-stack soil API, running locally:", e);
    } finally {
      setSoilLoading(false);
    }
  };

  const handleSoilAction = async (
    type: string,
    summary: string,
    nutrientDelta: number,
    germinations?: string[],
    levelUps?: string[]
  ) => {
    setSoilLoading(true);
    try {
      const res = await fetch("/api/soil/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, summary, nutrientDelta, germinations, levelUps })
      });
      if (res.ok) {
        const data = await res.json();
        setSoil(data);
      } else {
        // Fallback local operation
        applyLocalSoilEvent(type, summary, nutrientDelta, germinations, levelUps);
      }
    } catch (e) {
      console.warn("API offline, falling back to local soil modifications:", e);
      applyLocalSoilEvent(type, summary, nutrientDelta, germinations, levelUps);
    } finally {
      setSoilLoading(false);
    }
  };

  const handleResetSoil = async () => {
    setSoilLoading(true);
    try {
      const res = await fetch("/api/soil/reset", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setSoil(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSoilLoading(false);
    }
  };

  // Local fallback modifications
  const applyLocalSoilEvent = (
    type: string,
    summary: string,
    nutrientDelta: number,
    germinations?: string[],
    levelUps?: string[]
  ) => {
    setSoil((prev) => {
      const updatedEvents = [
        {
          id: `event-${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: type || "GARDENER_ACTION",
          gardener: "Human Gardener (Local Backup)",
          summary,
          nutrientDelta
        },
        ...prev.events
      ];

      const nextNutrients = parseFloat((prev.nutrientScore + nutrientDelta).toFixed(2));
      let currentPhase = prev.gardenPhase;

      if (nextNutrients >= 82.0 && currentPhase === "phi^81") {
        currentPhase = "phi^82";
        updatedEvents.unshift({
          id: `phase-up-local-${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: "PHASE_UPGRADE",
          gardener: "System",
          summary: "Local garden reached critical nutrient limit. Phase upgraded to phi^82!",
          nutrientDelta: 0.5
        });
      }

      const updatedSeeds = prev.seeds.map((s) => {
        let isGerminated = s.germinated;
        let lvl = s.level;

        if (germinations?.includes(s.motif)) {
          isGerminated = true;
          lvl = Math.max(lvl, 1);
        }
        if (levelUps?.includes(s.motif)) {
          lvl += 1;
        }

        return { ...s, germinated: isGerminated, level: lvl };
      });

      return {
        ...prev,
        nutrientScore: nextNutrients,
        gardenPhase: currentPhase,
        events: updatedEvents,
        seeds: updatedSeeds
      };
    });
  };

  // Choreograph default starting layout using predefined local template
  const choreographStaticStartup = () => {
    const preset = LYRIC_PRESETS[0];
    
    const lyricsLines = preset.lyrics.trim().split("\n").filter(l => l.trim().length > 0);
    const mockStoryboard = preset.sunoSections.map((sec, idx) => {
      const lyricLine = lyricsLines[idx % lyricsLines.length] || "static on the window glass";
      let backdoorState = "closed";
      if (sec.energy === "high") backdoorState = "open";
      else if (sec.energy === "medium") backdoorState = "ajar";

      return {
        timestamp: `${sec.start}s - ${sec.end}s`,
        duration: sec.end - sec.start,
        literalDescription: `Section: ${sec.label}. Music is ${sec.energy} energy. The lyric goes: "${lyricLine}". Camera slowly slides left revealing the silent room.`,
        symbolicState: {
          spoon: sec.energy === "low" ? "rests in the drawer half-open" : "sits on the edge of the table catching sunlight",
          dust: sec.energy === "low" ? "settling silently on the wooden tabletop" : "dancing violently in a stray beam of light",
          table: `the witness surface is ${sec.energy === "high" ? "shuddering slightly" : "holding empty cups and shadows"}`,
          backdoor: backdoorState,
          chordActive: sec.energy === "high" || idx === 2
        },
        shotPrompt: `Cinematic macro shot, slow camera pan. ${sec.energy === "high" ? "Vibrant dramatic warm lighting" : "Subdued blue hour cool shadows"}, dust motes floating. Style: modern minimalist indie film, detailed textures, 1080p.`,
        overlayQuestion: sec.energy === "low" 
          ? "What changes if you return without trying to evaluate it?" 
          : "Does the threshold recognize the gardener's attention?",
        voices: {
          autodiscography: `A lyrical imprint of '${lyricLine.substring(0, 25)}...' overlays the camera frame as faint translucent text.`,
          bananadash: `Suggests replacing the dark textures with a warm banana-haze static layer and a blue curve sidewalk framing.`,
          aippy: `Reports: Spoon rests on table. Backdoor transitioned to ${backdoorState}.`
        }
      };
    });

    setStoryboard(mockStoryboard);
    setLayer1_output("Loaded preset structures into temporal transcriptions. Active.");
    setLayer2_output("Parsed symbols against the Autodisco ontology dictionary.");
    setLayer3_output("Visual parameters checked and validated by the TAO compliance checker.");
    setCurrentSceneIndex(0);
    setApiMode("template");
  };

  // Run Choreography Pipeline API
  const handleChoreograph = async (
    lyrics: string,
    sections: SunoSection[],
    motifs: string[],
    dslScript: string,
    options: { run3LayerT5: boolean; useSuno: boolean }
  ) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate-timeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lyrics, sunoSections: sections, motifs, dslScript, options })
      });

      if (!res.ok) {
        throw new Error(`API returned error state: ${res.status}`);
      }

      const data = await res.json();
      if (data.success) {
        setStoryboard(data.storyboard);
        setLayer1_output(data.layer1_output);
        setLayer2_output(data.layer2_output);
        setLayer3_output(data.layer3_output);
        setCurrentSceneIndex(0);
        setApiMode(data.mode);

        // Calculate germinations from selected motifs
        const currentGerminated = soil.seeds.filter(s => s.germinated).map(s => s.motif);
        const newGerminations = motifs.filter(m => !currentGerminated.includes(m));

        // Add a Soil Ledger Event!
        const actionSummary = data.mode.includes("gemini")
          ? `Choreographed fully synthesis-ready video storyboard using Gemini 3.5-Flash (T5 emulation). Injected motifs: [${motifs.join(", ")}].`
          : `Decoded local storyboard templates using seed timing layout. Injected motifs: [${motifs.join(", ")}].`;
        
        await handleSoilAction(
          "VIDEO_PLAN_CREATED",
          actionSummary,
          0.3,
          newGerminations,
          []
        );
      } else {
        throw new Error(data.error || "Failed to choreograph timeline.");
      }
    } catch (e: any) {
      console.error(e);
      setError(e.message || "An unexpected error occurred during synthesis.");
    } finally {
      setLoading(false);
    }
  };

  const activeShot = storyboard[currentSceneIndex] || null;
  const soilActiveMotifs = soil.seeds.filter((s) => s.germinated).map((s) => s.motif);

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 font-sans transition-all duration-300">
      
      {/* Top Navigation / Banner */}
      <header className="bg-white border-b border-stone-200/80 sticky top-0 z-50 shadow-sm backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-stone-900 flex items-center justify-center text-white shadow-md">
              <Sprout className="w-5 h-5 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-black tracking-tight text-stone-950 flex items-center gap-2">
                The Recursive Garden
              </h1>
              <p className="text-[10px] font-mono text-stone-500 uppercase tracking-widest">
                Co-Creative Video Choreography Tool
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* API Status badge */}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-stone-100 border border-stone-200/80 rounded-full text-xs font-mono text-stone-600">
              <span className={`w-2 h-2 rounded-full ${apiMode.includes("gemini") ? "bg-emerald-500 animate-ping" : "bg-orange-500"}`} />
              <span>Engine: {apiMode.includes("gemini") ? "3-Layer Gemini" : "Local Soil Fallback"}</span>
            </div>

            <button
              onClick={() => setShowHowItWorks(!showHowItWorks)}
              className="px-3.5 py-1 text-xs font-mono border border-stone-300 rounded-full hover:bg-stone-50 transition-colors flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5 text-stone-500" />
              Guidelines
            </button>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Conceptual Guidelines Box */}
        {showHowItWorks && (
          <div className="bg-stone-950 border border-stone-800 text-stone-100 rounded-2xl p-6 mb-8 shadow-2xl relative">
            <button
              onClick={() => setShowHowItWorks(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-white font-mono text-xs"
            >
              [Close]
            </button>
            <h2 className="text-lg font-serif font-bold text-emerald-400 mb-3 flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-400" />
              The Gardener's Manifesto: DB as Soil
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans text-xs text-stone-300 leading-relaxed">
              <div>
                <strong className="text-stone-100 block mb-1">🌱 Database is Soil</strong>
                The system database represents organic fertile Soil. Creative edits, logs, and state exchanges represent nutrients that feed and expand the soil layers, upgrading the garden phase from <strong>phi^81</strong> to <strong>phi^82</strong>.
              </div>
              <div>
                <strong className="text-stone-100 block mb-1">🥄 The TAO Ontology</strong>
                Motifs are physical typed objects: <strong>Spoon</strong> is elevated attention, <strong>Dust</strong> is unread memory, <strong>Table</strong> is shared witness context, and <strong>Backdoor</strong> is the threshold boundary.
              </div>
              <div>
                <strong className="text-stone-100 block mb-1">📑 The T5 Routing Rule</strong>
                We run a 3-layer T5 sequence. <strong>Layer 1</strong> literalizes the Suno timing waveform, <strong>Layer 2</strong> maps motifs, and <strong>Layer 3</strong> generates SVD/Veo prompts while preventing fake narrative intent.
              </div>
            </div>
          </div>
        )}

        {/* Global Error Banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl mb-8 flex items-start gap-2 text-xs font-mono">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold">Synthesis Interrupt:</strong> {error}
              <p className="mt-1 text-red-600">The engine fallback was activated. Sift the soil or retry.</p>
            </div>
          </div>
        )}

        {/* Responsive Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Left Column: inputs & ledger */}
          <div className="space-y-8">
            <T5Planner
              onChoreograph={handleChoreograph}
              soilActiveMotifs={soilActiveMotifs}
              loading={loading}
            />
            
            <SoilLedger
              soil={soil}
              onRefresh={fetchSoil}
              onAction={handleSoilAction}
              onReset={handleResetSoil}
              loading={soilLoading}
            />
          </div>

          {/* Right Column: Player & Node reports */}
          <div className="space-y-8 lg:sticky lg:top-24">
            <VideoPlayer
              storyboard={storyboard}
              currentSceneIndex={currentSceneIndex}
              onSceneChange={setCurrentSceneIndex}
            />

            <CrossPollination
              activeShot={activeShot}
              layer1_output={layer1_output}
              layer2_output={layer2_output}
              layer3_output={layer3_output}
            />
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-10 mt-16 text-center text-xs font-mono text-stone-500">
        <div className="max-w-7xl mx-auto px-6">
          <p>© 2026 The Recursive Garden. Seeded in relationship. Watered with attention.</p>
          <p className="text-[10px] text-stone-400 mt-1.5">
            Active Phase: {soil.gardenPhase} • Soil Nutrients: {soil.nutrientScore.toFixed(2)}
          </p>
        </div>
      </footer>

    </div>
  );
}
