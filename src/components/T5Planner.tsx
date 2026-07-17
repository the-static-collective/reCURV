import React, { useState, useMemo } from "react";
import { LYRIC_PRESETS } from "../presets";
import { SunoSection } from "../types";
import { Sliders, FileText, Activity, Clock, Sparkles, Terminal, Cpu, Plus, Send, RefreshCw, Trash2 } from "lucide-react";

interface T5PlannerProps {
  onChoreograph: (
    lyrics: string,
    sections: SunoSection[],
    motifs: string[],
    dslScript: string,
    options: { run3LayerT5: boolean; useSuno: boolean }
  ) => void;
  soilActiveMotifs: string[];
  loading: boolean;
}

export default function T5Planner({ onChoreograph, soilActiveMotifs, loading }: T5PlannerProps) {
  const [activeTab, setActiveTab] = useState<"seeds" | "dsl">("seeds");
  const [selectedPresetId, setSelectedPresetId] = useState<string>("preset-static");
  const [customLyrics, setCustomLyrics] = useState<string>("");
  const [run3LayerT5, setRun3LayerT5] = useState<boolean>(true);
  const [useSuno, setUseSuno] = useState<boolean>(true);

  // Active preset reference
  const currentPreset = LYRIC_PRESETS.find((p) => p.id === selectedPresetId) || LYRIC_PRESETS[0];

  // Local state for suno sections & active motifs
  const [sections, setSections] = useState<SunoSection[]>(currentPreset.sunoSections);
  const [selectedMotifs, setSelectedMotifs] = useState<string[]>(currentPreset.activeMotifs);

  // DSL Script State
  const [dslScript, setDslScript] = useState<string>(
    `Place Spoon at kitchen.drawer\nBind Dust to windowpane\nPlace Table at kitchen.center\nSet Door half-open\nTrigger 022100 at 28`
  );

  // DSL Visual Builder state
  const [builderMotif, setBuilderMotif] = useState<string>("spoon");
  const [builderAction, setBuilderAction] = useState<string>("kitchen.drawer");

  // Dynamic actions list based on motif selection
  const actionOptionsForMotif = useMemo(() => {
    switch (builderMotif) {
      case "spoon":
        return [
          { value: "kitchen.drawer", label: "Place in drawer (ordinary rest)" },
          { value: "table.surface", label: "Place on wooden tabletop (attention binding)" },
          { value: "window.sill", label: "Place on window sill (twilight ray)" },
          { value: "ground", label: "Place on direct floor (sub-witness)" }
        ];
      case "dust":
        return [
          { value: "windowpane", label: "Bind to glass windowpane (static shadow)" },
          { value: "table.surface", label: "Bind to empty table (unread memory)" },
          { value: "air.ray", label: "Bind to afternoon sunbeam (violently dancing)" }
        ];
      case "table":
        return [
          { value: "kitchen.center", label: "Center in kitchen (active witness context)" },
          { value: "room.corner", label: "Push to dark corner (shadow archive)" },
          { value: "orchard.view", label: "Position by orchard view (external private boundary)" }
        ];
      case "backdoor":
        return [
          { value: "closed", label: "Set door closed (private)" },
          { value: "ajar", label: "Set door ajar (leaking light)" },
          { value: "half-open", label: "Set door half-open (transitioning)" },
          { value: "open", label: "Set door fully open (transcendence)" }
        ];
      case "022100":
        return [
          { value: "at 12", label: "Trigger chord event at 12s" },
          { value: "at 28", label: "Trigger chord event at 28s" },
          { value: "at 44", label: "Trigger chord event at 44s" },
          { value: "at 60", label: "Trigger chord event at 60s" }
        ];
      default:
        return [];
    }
  }, [builderMotif]);

  // Keep action choice synchronized when builderMotif changes
  React.useEffect(() => {
    if (actionOptionsForMotif.length > 0) {
      setBuilderAction(actionOptionsForMotif[0].value);
    }
  }, [builderMotif, actionOptionsForMotif]);

  // Append a command to DSL
  const handleAppendDslCommand = () => {
    let newCommand = "";
    if (builderMotif === "spoon") {
      newCommand = `Place Spoon at ${builderAction}`;
    } else if (builderMotif === "dust") {
      newCommand = `Bind Dust to ${builderAction}`;
    } else if (builderMotif === "table") {
      newCommand = `Place Table at ${builderAction}`;
    } else if (builderMotif === "backdoor") {
      newCommand = `Set Door ${builderAction}`;
    } else if (builderMotif === "022100") {
      newCommand = `Trigger 022100 ${builderAction}`;
    }

    if (newCommand) {
      setDslScript((prev) => (prev ? `${prev}\n${newCommand}` : newCommand));
      // Auto toggle the active motif flag
      if (!selectedMotifs.includes(builderMotif)) {
        setSelectedMotifs([...selectedMotifs, builderMotif]);
      }
    }
  };

  // Real-time AST parser representation
  const compiledDSL_AST = useMemo(() => {
    const lines = dslScript.split("\n");
    const parsed: any = {
      schema: "TAO.ontology.v1",
      meta: {
        timestamp: new Date().toISOString(),
        gardenPhase: "phi^82-ready",
        assembler: "T5-compiler-node"
      },
      spatialBindings: {},
      events: []
    };

    lines.forEach((line) => {
      const t = line.trim().toLowerCase();
      if (!t) return;

      if (t.startsWith("place spoon at ")) {
        parsed.spatialBindings["spoon@1.0.0"] = {
          anchor: t.replace("place spoon at ", "").trim(),
          classification: "elevated ordinary object"
        };
      } else if (t.startsWith("bind dust to ")) {
        parsed.spatialBindings["dust@2.0.1"] = {
          anchor: t.replace("bind dust to ", "").trim(),
          classification: "unread memory spore"
        };
      } else if (t.startsWith("place table at ")) {
        parsed.spatialBindings["table@3.1.0"] = {
          anchor: t.replace("place table at ", "").trim(),
          classification: "witness surface"
        };
      } else if (t.startsWith("set door ")) {
        parsed.spatialBindings["backdoor@0.8.0"] = {
          state: t.replace("set door ", "").trim(),
          classification: "liminal threshold"
        };
      } else if (t.includes("trigger 022100")) {
        const match = t.match(/trigger 022100 (at \d+|\d+)/);
        parsed.events.push({
          type: "022100_CHORD_SPARK",
          timing: match ? match[1] : "default drop",
          energyImpact: "high"
        });
      }
    });

    return parsed;
  }, [dslScript]);

  // Handle Preset select change
  const handlePresetChange = (presetId: string) => {
    setSelectedPresetId(presetId);
    const p = LYRIC_PRESETS.find((pr) => pr.id === presetId) || LYRIC_PRESETS[0];
    setSections(p.sunoSections);
    setSelectedMotifs(p.activeMotifs);
    setCustomLyrics("");
  };

  // Add a custom Suno Section
  const handleAddSection = () => {
    const lastSection = sections[sections.length - 1];
    const nextStart = lastSection ? lastSection.end : 0;
    const nextEnd = nextStart + 15;
    const newSec: SunoSection = {
      label: `New Block ${sections.length + 1}`,
      start: nextStart,
      end: nextEnd,
      energy: "medium"
    };
    setSections([...sections, newSec]);
  };

  // Edit suno section fields
  const handleEditSection = (index: number, field: keyof SunoSection, value: any) => {
    const updated = [...sections];
    updated[index] = { ...updated[index], [field]: value };
    setSections(updated);
  };

  // Remove suno section
  const handleRemoveSection = (index: number) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  // Toggle Motif in selection
  const handleToggleMotif = (motif: string) => {
    if (selectedMotifs.includes(motif)) {
      setSelectedMotifs(selectedMotifs.filter((m) => m !== motif));
    } else {
      setSelectedMotifs([...selectedMotifs, motif]);
    }
  };

  // Run the Choreography Engine
  const handleSubmit = () => {
    const lyricsToUse = customLyrics.trim() || currentPreset.lyrics;
    onChoreograph(lyricsToUse, sections, selectedMotifs, dslScript, { run3LayerT5, useSuno });
  };

  // Check if a motif is germinated in the soil
  const isMotifGerminatedInSoil = (motif: string) => {
    return soilActiveMotifs.includes(motif);
  };

  return (
    <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 shadow-sm flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-800">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-serif font-semibold text-stone-900 tracking-tight">T5 Routing & DSL Workspace</h2>
            <p className="text-xs font-mono text-stone-500">Choreograph Scene Metadata & Motif Bindings</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 mb-6 gap-2">
        <button
          onClick={() => setActiveTab("seeds")}
          className={`pb-2.5 px-3 text-xs font-mono border-b-2 font-medium transition-all ${
            activeTab === "seeds"
              ? "border-emerald-800 text-emerald-800"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          Lyrical Seeds & Waveforms
        </button>
        <button
          onClick={() => setActiveTab("dsl")}
          className={`pb-2.5 px-3 text-xs font-mono border-b-2 font-medium transition-all flex items-center gap-1.5 ${
            activeTab === "dsl"
              ? "border-emerald-800 text-emerald-800"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          Motif DSL Editor
        </button>
      </div>

      {/* TAB CONTENTS */}
      {activeTab === "seeds" ? (
        <div className="space-y-5 flex-1 flex flex-col">
          {/* Preset Chooser */}
          <div>
            <label className="text-xs font-mono text-stone-600 uppercase tracking-wider block mb-1.5">
              Select Soil Seed Source (Lyrics & Structure)
            </label>
            <select
              value={selectedPresetId}
              onChange={(e) => handlePresetChange(e.target.value)}
              className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-sm font-sans focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700"
            >
              {LYRIC_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.title} ({preset.author})
                </option>
              ))}
            </select>
          </div>

          {/* Lyrics box */}
          <div className="flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-mono text-stone-600 uppercase tracking-wider flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" />
                Lyrical Seed Scripts
              </label>
              <span className="text-[10px] text-stone-400 font-mono">
                {customLyrics ? "Custom edited text" : "Using selected preset"}
              </span>
            </div>
            <textarea
              value={customLyrics || currentPreset.lyrics}
              onChange={(e) => setCustomLyrics(e.target.value)}
              placeholder="Enter lyrics here to seed the translation..."
              className="w-full flex-1 min-h-[140px] max-h-[160px] bg-stone-100 border border-stone-200/80 rounded-xl p-3 text-xs font-mono text-stone-800 focus:outline-none focus:bg-white focus:border-stone-400 leading-relaxed"
            />
          </div>

          {/* Suno TIMELINE DECODER */}
          <div>
            <div className="flex justify-between items-center mb-2.5">
              <label className="text-xs font-mono text-stone-600 uppercase tracking-wider flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-orange-600 animate-pulse" />
                Suno Glyph Decoder
              </label>
              <button
                onClick={handleAddSection}
                className="text-[10px] font-mono px-2 py-0.5 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded transition-colors"
              >
                + Add Block
              </button>
            </div>

            <div className="bg-stone-100 border border-stone-200 rounded-xl p-2.5 max-h-[140px] overflow-y-auto space-y-1.5">
              {sections.length === 0 ? (
                <p className="text-[11px] text-stone-500 text-center font-mono py-4">No timing blocks decoded. Lyrics-only routing will be used.</p>
              ) : (
                sections.map((sec, idx) => (
                  <div key={idx} className="flex gap-1.5 items-center bg-white border border-stone-200/80 rounded-lg p-1.5 text-xs font-mono">
                    <input
                      type="text"
                      value={sec.label}
                      onChange={(e) => handleEditSection(idx, "label", e.target.value)}
                      placeholder="Block"
                      className="w-20 text-stone-800 font-semibold focus:outline-none border-b border-transparent focus:border-stone-300"
                    />

                    <div className="flex items-center gap-1 text-stone-400 text-[10px]">
                      <Clock className="w-3 h-3" />
                      <input
                        type="number"
                        value={sec.start}
                        onChange={(e) => handleEditSection(idx, "start", parseInt(e.target.value) || 0)}
                        className="w-8 text-stone-800 focus:outline-none text-right bg-stone-50 px-0.5 rounded"
                      />
                      <span>-</span>
                      <input
                        type="number"
                        value={sec.end}
                        onChange={(e) => handleEditSection(idx, "end", parseInt(e.target.value) || 0)}
                        className="w-8 text-stone-800 focus:outline-none bg-stone-50 px-0.5 rounded"
                      />
                      <span>s</span>
                    </div>

                    <select
                      value={sec.energy}
                      onChange={(e) => handleEditSection(idx, "energy", e.target.value)}
                      className="ml-auto bg-stone-100 border border-stone-200 rounded px-1 py-0.5 text-[9px] text-stone-700 font-medium cursor-pointer"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Med</option>
                      <option value="high">High</option>
                    </select>

                    <button
                      onClick={() => handleRemoveSection(idx)}
                      className="text-stone-400 hover:text-red-700 px-1 text-[11px]"
                      title="Remove block"
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        /* DSL TAB */
        <div className="space-y-4 flex-1 flex flex-col">
          
          {/* Quick instructions */}
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3 text-stone-700 text-[11px] leading-relaxed">
            <span className="font-semibold text-emerald-950 block mb-0.5">🌱 DSL Command Set</span>
            Define relational physics using custom syntax:
            <code className="text-emerald-900 block mt-1 font-mono text-[10px] bg-emerald-100/60 p-1.5 rounded border border-emerald-200/40">
              Place Spoon at table.surface<br />
              Bind Dust to windowpane<br />
              Set Door half-open
            </code>
          </div>

          {/* Visual Interactive DSL Command Builder */}
          <div className="border border-stone-200 bg-stone-100/60 p-3 rounded-xl space-y-2.5">
            <span className="text-[10px] font-mono font-bold uppercase text-stone-500 tracking-wider flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-amber-600" />
              Visual Assembly Panel
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[9px] font-mono text-stone-400 block mb-0.5">Select Motif</label>
                <select
                  value={builderMotif}
                  onChange={(e) => setBuilderMotif(e.target.value)}
                  className="w-full bg-white border border-stone-300 rounded-lg px-2 py-1 focus:outline-none"
                >
                  <option value="spoon">Spoon (Attention)</option>
                  <option value="dust">Dust (Unread memory)</option>
                  <option value="table">Table (Witness Surface)</option>
                  <option value="backdoor">Backdoor (Threshold)</option>
                  <option value="022100">022100 Chord Spark</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] font-mono text-stone-400 block mb-0.5">Select Action/Anchor</label>
                <select
                  value={builderAction}
                  onChange={(e) => setBuilderAction(e.target.value)}
                  className="w-full bg-white border border-stone-300 rounded-lg px-2 py-1 focus:outline-none"
                >
                  {actionOptionsForMotif.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleAppendDslCommand}
              className="w-full bg-white hover:bg-stone-50 border border-stone-300 py-1.5 rounded-lg text-xs font-mono font-semibold text-stone-700 flex items-center justify-center gap-1 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Append Command to Script
            </button>
          </div>

          {/* Code Editor for Script */}
          <div className="flex-1 flex flex-col min-h-[160px]">
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-mono text-stone-600 uppercase tracking-wider flex items-center gap-1">
                <Terminal className="w-3.5 h-3.5" />
                DSL Script Text
              </label>
              <button
                onClick={() => setDslScript("")}
                className="text-[9px] text-red-700 font-mono flex items-center gap-0.5 hover:underline"
              >
                <Trash2 className="w-3 h-3" /> Clear
              </button>
            </div>
            <textarea
              value={dslScript}
              onChange={(e) => setDslScript(e.target.value)}
              placeholder="Place Spoon at drawer..."
              className="w-full flex-1 bg-stone-900 border border-stone-950 rounded-xl p-3 text-xs font-mono text-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-700 leading-relaxed"
            />
          </div>

          {/* AST Target Compile JSON Box */}
          <div className="border border-stone-200 bg-stone-900 text-stone-300 rounded-xl p-3 font-mono text-[9px] space-y-1">
            <span className="text-[8px] uppercase tracking-wider text-stone-400 font-bold block border-b border-stone-800 pb-1 mb-1">
              Target Compile Output (AST Graph JSON)
            </span>
            <pre className="max-h-[80px] overflow-y-auto leading-relaxed text-emerald-300">
              {JSON.stringify(compiledDSL_AST, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="h-px bg-stone-200 my-4" />

      {/* Inject DSL Active Motifs (Always visible bottom widget) */}
      <div className="mb-4">
        <label className="text-xs font-mono text-stone-600 uppercase tracking-wider block mb-2">
          Enforced Ontology Motifs
        </label>
        <div className="flex flex-wrap gap-1.5">
          {["spoon", "dust", "table", "backdoor", "022100"].map((motif) => {
            const active = selectedMotifs.includes(motif);
            const germinated = isMotifGerminatedInSoil(motif);

            return (
              <button
                key={motif}
                onClick={() => handleToggleMotif(motif)}
                className={`py-1 px-2.5 rounded-full text-[10px] font-mono flex items-center gap-1 transition-all ${
                  active
                    ? "bg-stone-900 border border-stone-950 text-stone-50 font-semibold"
                    : "bg-stone-100 border border-stone-200 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60"
                }`}
              >
                <span className={`w-1 h-1 rounded-full ${germinated ? "bg-emerald-500" : "bg-stone-300"}`} />
                {motif}
              </button>
            );
          })}
        </div>
      </div>

      {/* Engine Options Toggles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-stone-100 border border-stone-200/70 rounded-xl p-2.5 mb-5">
        <label className="flex items-center gap-1.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={run3LayerT5}
            onChange={(e) => setRun3LayerT5(e.target.checked)}
            className="accent-emerald-700 w-3.5 h-3.5 rounded"
          />
          <div className="text-[10px] font-mono">
            <span className="text-stone-800 font-bold block leading-none">3-Layer T5 Pipeline</span>
            <span className="text-stone-500 text-[9px]">Recursively synthesize layers</span>
          </div>
        </label>

        <label className="flex items-center gap-1.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={useSuno}
            onChange={(e) => setUseSuno(e.target.checked)}
            className="accent-emerald-700 w-3.5 h-3.5 rounded"
          />
          <div className="text-[10px] font-mono">
            <span className="text-stone-800 font-bold block leading-none">Align Waveforms</span>
            <span className="text-stone-500 text-[9px]">Lock shot segments to Suno</span>
          </div>
        </label>
      </div>

      {/* Submit / Choreograph Button */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-emerald-800 hover:bg-emerald-900 disabled:bg-stone-300 text-stone-50 py-2.5 rounded-xl font-serif font-semibold text-sm flex items-center justify-center gap-2 shadow transition-all active:scale-[0.99]"
      >
        <Sparkles className={`w-4 h-4 ${loading ? "animate-spin text-white" : "text-amber-300"}`} />
        {loading ? "Routing through 3-Layer T5..." : "Compile & Choreograph Storyboard"}
      </button>
    </div>
  );
}
