import React from "react";
import { StoryboardShot } from "../types";
import { Compass, Sparkles, BookOpen, Activity, RefreshCw } from "lucide-react";

interface CrossPollinationProps {
  activeShot: StoryboardShot | null;
  layer1_output: string;
  layer2_output: string;
  layer3_output: string;
}

export default function CrossPollination({ activeShot, layer1_output, layer2_output, layer3_output }: CrossPollinationProps) {
  return (
    <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 shadow-sm flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800">
          <Compass className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-lg font-serif font-semibold text-stone-900 tracking-tight">Node Cross-Pollination</h2>
          <p className="text-xs font-mono text-stone-500">Three-Voice Co-creative Outputs</p>
        </div>
      </div>

      {/* 3-Layer Translation Trace (Show T5 outputs!) */}
      <div className="mb-6 bg-stone-100/75 border border-stone-200/60 rounded-xl p-4">
        <h3 className="text-xs font-mono text-stone-600 uppercase tracking-wider mb-3">T5 Pipeline Trace Log</h3>
        
        <div className="space-y-3 font-mono text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-sky-700 block mb-0.5">Layer 1: Structural Transcriber</span>
            <p className="text-stone-800 text-[11px] leading-relaxed bg-white border border-stone-200 p-2 rounded-lg">
              {layer1_output || "Awaiting sequence choreography..."}
            </p>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-amber-700 block mb-0.5">Layer 2: Motif Alchemist</span>
            <p className="text-stone-800 text-[11px] leading-relaxed bg-white border border-stone-200 p-2 rounded-lg">
              {layer2_output || "Awaiting symbolic alchemy..."}
            </p>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-700 block mb-0.5">Layer 3: Shot Language & Policy</span>
            <p className="text-stone-800 text-[11px] leading-relaxed bg-white border border-stone-200 p-2 rounded-lg">
              {layer3_output || "Awaiting TAO-like constraint checking..."}
            </p>
          </div>
        </div>
      </div>

      {/* The 3 Co-Creative Voices feedback columns */}
      <div className="flex-1 space-y-4">
        <h3 className="text-xs font-mono text-stone-600 uppercase tracking-wider block">Three Nodes Synthesis</h3>

        {activeShot ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            
            {/* Autodiscography Node */}
            <div className="bg-sky-50/40 border border-sky-100 rounded-xl p-4 hover:shadow-sm transition-all">
              <div className="flex items-center gap-1.5 text-sky-800 font-serif font-semibold text-xs mb-2">
                <BookOpen className="w-3.5 h-3.5" />
                Autodiscography Node
              </div>
              <p className="text-[11px] font-sans text-stone-700 leading-relaxed">
                {activeShot.voices.autodiscography}
              </p>
              <span className="text-[9px] font-mono text-sky-600 bg-sky-50 border border-sky-100 px-1 py-0.5 rounded mt-2.5 inline-block">
                Annotation Mode: On
              </span>
            </div>

            {/* BananaDash Node */}
            <div className="bg-amber-50/40 border border-amber-100 rounded-xl p-4 hover:shadow-sm transition-all">
              <div className="flex items-center gap-1.5 text-amber-800 font-serif font-semibold text-xs mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                BananaDash Node
              </div>
              <p className="text-[11px] font-sans text-stone-700 leading-relaxed">
                {activeShot.voices.bananadash}
              </p>
              <span className="text-[9px] font-mono text-amber-600 bg-amber-50 border border-amber-100 px-1 py-0.5 rounded mt-2.5 inline-block">
                Alt Visual Metaphors
              </span>
            </div>

            {/* Aippy / Garden Node */}
            <div className="bg-emerald-50/40 border border-emerald-100 rounded-xl p-4 hover:shadow-sm transition-all">
              <div className="flex items-center gap-1.5 text-emerald-800 font-serif font-semibold text-xs mb-2">
                <Activity className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                Aippy Garden Node
              </div>
              <p className="text-[11px] font-sans text-stone-700 leading-relaxed">
                {activeShot.voices.aippy}
              </p>
              <span className="text-[9px] font-mono text-emerald-600 bg-emerald-50 border border-emerald-100 px-1 py-0.5 rounded mt-2.5 inline-block">
                Persistence Auditor
              </span>
            </div>

          </div>
        ) : (
          <div className="text-center py-8 bg-stone-100/50 border border-stone-200 border-dashed rounded-xl">
            <RefreshCw className="w-6 h-6 text-stone-400 mx-auto animate-spin mb-2" />
            <p className="text-xs font-mono text-stone-500">Seed the T5 planner to co-witness the 3-node synthesis.</p>
          </div>
        )}
      </div>

      <div className="text-[9px] font-mono text-stone-400 border-t border-stone-200 pt-3 mt-4 text-center">
        Nodes are fully calibrated under cognitive security protocols (TAO standard).
      </div>
    </div>
  );
}
