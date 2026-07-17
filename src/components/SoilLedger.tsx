import React, { useState } from "react";
import { SoilLedgerState, GardenSeed } from "../types";
import { Sprout, RefreshCw, Droplets, Scissors, Sparkles, Plus, Info } from "lucide-react";

interface SoilLedgerProps {
  soil: SoilLedgerState;
  onRefresh: () => void;
  onAction: (type: string, summary: string, nutrientDelta: number, germinations?: string[], levelUps?: string[]) => void;
  onReset: () => void;
  loading: boolean;
}

export default function SoilLedger({ soil, onRefresh, onAction, onReset, loading }: SoilLedgerProps) {
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  // Simple actions
  const handleWater = () => {
    onAction(
      "WATER_SOIL",
      "Watered the dry soil layers. Ambient moisture level increased.",
      0.08
    );
  };

  const handlePrune = () => {
    onAction(
      "PRUNE_GARDEN",
      "Pruned inactive node linkages and consolidated symbolic memory branches.",
      0.12
    );
  };

  const handleLevelUpSeed = (seed: GardenSeed) => {
    const summary = seed.germinated
      ? `Fertilized the germinated [${seed.name}]. Level increased from ${seed.level} to ${seed.level + 1}.`
      : `Germinated [${seed.name}] seed using concentrated attention. Motif is now fully active.`;
    
    if (seed.germinated) {
      onAction("SEED_FERTILIZED", summary, 0.15, [], [seed.motif]);
    } else {
      onAction("SEED_GERMINATED", summary, 0.25, [seed.motif], []);
    }
  };

  return (
    <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 shadow-sm flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800">
            <Sprout className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-serif font-semibold text-stone-900 tracking-tight">Database Soil</h2>
            <p className="text-xs font-mono text-stone-500">Persistent Ledger</p>
          </div>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors duration-150 disabled:opacity-50"
          title="Sift soil layers (Refresh)"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Nutrient / Phase Meter */}
      <div className="bg-stone-100 border border-stone-200/60 rounded-xl p-5 mb-6">
        <div className="flex justify-between items-baseline mb-2">
          <span className="text-xs font-mono text-stone-600 uppercase tracking-wider">Garden Phase</span>
          <span className="text-2xl font-serif font-black text-emerald-800">{soil.gardenPhase}</span>
        </div>
        
        {/* Progress bar representing nutrients towards phi^82 */}
        <div className="w-full bg-stone-200 h-3 rounded-full overflow-hidden relative mb-3">
          <div
            className="bg-emerald-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, ((soil.nutrientScore - 80.0) / 2.0) * 100))}%` }}
          />
        </div>

        <div className="flex justify-between text-[11px] font-mono text-stone-500">
          <span>Nutrients: <strong className="text-stone-800 font-semibold">{soil.nutrientScore.toFixed(2)}</strong></span>
          {soil.gardenPhase === "phi^81" ? (
            <span>Goal: <strong className="text-stone-800 font-semibold">82.00</strong> to reach phi^82</span>
          ) : (
            <span className="text-emerald-700 font-semibold">Maximum Organic Capacity Reached!</span>
          )}
        </div>
      </div>

      {/* Seeds in the Soil */}
      <div className="mb-6">
        <h3 className="text-xs font-mono text-stone-600 uppercase tracking-wider mb-3">Sown Motif Seeds</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {soil.seeds.map((seed) => (
            <div
              key={seed.id}
              className={`p-3 rounded-xl border flex flex-col justify-between transition-all duration-200 relative group ${
                seed.germinated
                  ? "bg-stone-100 border-stone-300 shadow-sm"
                  : "bg-stone-50 border-stone-200 border-dashed"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-serif font-semibold text-stone-800">{seed.name.split(" ")[0]}</span>
                    {seed.germinated ? (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono">
                        Lv.{seed.level}
                      </span>
                    ) : (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-stone-200 text-stone-600 font-mono border border-stone-300">
                        Dormant
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-stone-500 italic mt-0.5">
                    {seed.motif === "spoon" && "Elevated attention"}
                    {seed.motif === "dust" && "Unread memory"}
                    {seed.motif === "table" && "Shared context"}
                    {seed.motif === "backdoor" && "Threshold link"}
                    {seed.motif === "022100" && "Event chord spark"}
                  </p>
                </div>
                
                <button
                  onClick={() => setShowTooltip(showTooltip === seed.id ? null : seed.id)}
                  className="p-1 text-stone-400 hover:text-stone-700"
                >
                  <Info className="w-3 h-3" />
                </button>
              </div>

              {showTooltip === seed.id && (
                <div className="absolute top-10 left-3 right-3 bg-stone-900 text-stone-100 text-[10px] p-2 rounded shadow-md z-10 font-sans">
                  {seed.motif === "spoon" && "A physical everyday utensil elevated into a sacred watcher through continuous co-creative focus."}
                  {seed.motif === "dust" && "Tiny material traces settling over surfaces. It represents history that is physically visible but unread by the gardeners."}
                  {seed.motif === "table" && "The wooden tabletop representing shared witness context. If items sit here, they are co-registered."}
                  {seed.motif === "backdoor" && "The boundary threshold separating private memory from the shared open orchard garden outside."}
                  {seed.motif === "022100" && "An exact music chord event trigger that marks a returning spark of intensive co-creative synthesis."}
                </div>
              )}

              <button
                onClick={() => handleLevelUpSeed(seed)}
                className={`mt-2.5 w-full py-1 rounded text-[11px] font-mono flex items-center justify-center gap-1 transition-all duration-150 ${
                  seed.germinated
                    ? "bg-stone-200 hover:bg-stone-300 text-stone-800"
                    : "bg-emerald-700 hover:bg-emerald-800 text-white"
                }`}
              >
                {seed.germinated ? (
                  <>
                    <Sparkles className="w-3 h-3 text-emerald-600 animate-pulse" />
                    Fertilize Motif
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    Germinate Seed
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Gardener Routine Buttons */}
      <div className="mb-6 border-t border-stone-200 pt-4">
        <h3 className="text-xs font-mono text-stone-600 uppercase tracking-wider mb-3">Gardening Routine</h3>
        <div className="flex gap-2">
          <button
            onClick={handleWater}
            className="flex-1 py-2 px-3 bg-sky-50 border border-sky-200 text-sky-800 rounded-xl text-xs font-mono font-medium flex items-center justify-center gap-1.5 hover:bg-sky-100 transition-colors"
          >
            <Droplets className="w-4 h-4 text-sky-600" />
            Water Soil (+0.08)
          </button>
          <button
            onClick={handlePrune}
            className="flex-1 py-2 px-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-mono font-medium flex items-center justify-center gap-1.5 hover:bg-emerald-100 transition-colors"
          >
            <Scissors className="w-4 h-4 text-emerald-600" />
            Prune Links (+0.12)
          </button>
        </div>
      </div>

      {/* Soil Activity Ledger Events */}
      <div className="flex-1 overflow-y-auto border-t border-stone-200 pt-4 max-h-[220px] pr-1">
        <h3 className="text-xs font-mono text-stone-600 uppercase tracking-wider mb-3">Soil Ledger Activity</h3>
        <div className="space-y-3 font-mono text-xs">
          {soil.events.map((event) => (
            <div key={event.id} className="border-l-2 border-stone-300 pl-3 py-0.5 hover:border-emerald-600 transition-all">
              <div className="flex justify-between items-start text-[10px] text-stone-500">
                <span>{new Date(event.timestamp).toLocaleTimeString()} • {event.gardener}</span>
                <span className={event.nutrientDelta > 0 ? "text-emerald-700" : "text-stone-400"}>
                  {event.nutrientDelta > 0 ? `+${event.nutrientDelta}` : ""}
                </span>
              </div>
              <p className="text-stone-800 text-[11px] font-medium leading-relaxed mt-0.5">{event.summary}</p>
              <span className="text-[9px] uppercase tracking-wide bg-stone-200 text-stone-600 px-1 rounded">
                {event.type}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-stone-200 pt-4 mt-4 flex justify-between items-center text-[10px] font-mono text-stone-400">
        <span>Soil is biologically active.</span>
        <button
          onClick={onReset}
          className="text-stone-400 hover:text-red-700 underline"
        >
          Sterilize Soil
        </button>
      </div>
    </div>
  );
}
