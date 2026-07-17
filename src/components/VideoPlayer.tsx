import React, { useState, useEffect, useRef } from "react";
import { StoryboardShot } from "../types";
import { Play, Pause, Volume2, VolumeX, Eye, Sparkles, AlertCircle, HelpCircle } from "lucide-react";

interface VideoPlayerProps {
  storyboard: StoryboardShot[];
  currentSceneIndex: number;
  onSceneChange: (idx: number) => void;
}

export default function VideoPlayer({ storyboard, currentSceneIndex, onSceneChange }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showPromptDetails, setShowPromptDetails] = useState<boolean>(false);

  // References
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const requestRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorNodeRef = useRef<OscillatorNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Active scene
  const activeScene = storyboard[currentSceneIndex] || null;

  // Calculate total duration
  const totalDuration = storyboard.reduce((acc, shot) => acc + (shot.duration || 10), 0);

  // Find active scene based on custom elapsed playhead time
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + 0.1;
        if (next >= totalDuration) {
          setIsPlaying(false);
          return 0;
        }

        // Map currentTime to storyboard indices
        let accumulated = 0;
        let foundIdx = 0;
        for (let i = 0; i < storyboard.length; i++) {
          accumulated += storyboard[i].duration;
          if (next <= accumulated) {
            foundIdx = i;
            break;
          }
        }
        if (foundIdx !== currentSceneIndex) {
          onSceneChange(foundIdx);
        }

        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, storyboard, currentSceneIndex, totalDuration, onSceneChange]);

  // Audio Context initialization for ambient co-creative garden synthesizer
  const initAudio = () => {
    if (audioCtxRef.current) return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      // Create a low pass biquad filter for earthy, analog tone
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(400, ctx.currentTime);
      filterNodeRef.current = filter;

      // Create main output volume gain node
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(isMuted ? 0 : 0.05, ctx.currentTime);
      gainNodeRef.current = gain;

      // Chain: filter -> gain -> destination
      filter.connect(gain);
      gain.connect(ctx.destination);
    } catch (e) {
      console.error("Failed to initialize garden audio context:", e);
    }
  };

  // Synchronize audio drone pitch to active scene energy state
  useEffect(() => {
    if (!isPlaying || isMuted || !audioCtxRef.current) {
      // Fade out if paused
      if (gainNodeRef.current) {
        gainNodeRef.current.gain.setValueAtTime(0, audioCtxRef.current?.currentTime || 0);
      }
      stopOscillator();
      return;
    }

    // Ensure audio is initialized and running
    initAudio();
    if (audioCtxRef.current?.state === "suspended") {
      audioCtxRef.current.resume();
    }

    const ctx = audioCtxRef.current!;
    
    // Smoothly fade volume in
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.5);
    }

    // Determine target pitches depending on energy shifts
    let frequency = 110; // low drone (A2)
    if (activeScene) {
      const state = activeScene.symbolicState;
      if (state.chordActive) {
        // Trigger a gorgeous, resonant 022100 chord! (E3, A3, B3, E4)
        frequency = 164.81; // E3 reference, and we can trigger multiple oscillators or increase filter freq
        if (filterNodeRef.current) {
          filterNodeRef.current.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.4);
        }
      } else if (activeScene.literalDescription.toLowerCase().includes("high") || activeScene.shotPrompt.toLowerCase().includes("vibrant")) {
        frequency = 130.81; // C3
        if (filterNodeRef.current) {
          filterNodeRef.current.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.8);
        }
      } else {
        // Low energy drone
        frequency = 98.0; // G2 earthy low note
        if (filterNodeRef.current) {
          filterNodeRef.current.frequency.exponentialRampToValueAtTime(250, ctx.currentTime + 1.2);
        }
      }
    }

    startOscillator(frequency);
  }, [isPlaying, isMuted, currentSceneIndex, activeScene]);

  const startOscillator = (freq: number) => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    if (!oscillatorNodeRef.current) {
      const osc = ctx.createOscillator();
      osc.type = "sawtooth"; // Rich harmonics that we cut down with the lowpass filter
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.connect(filterNodeRef.current!);
      osc.start();
      oscillatorNodeRef.current = osc;
    } else {
      // Ramp pitch smoothly to prevent pops and mimic a slide return
      oscillatorNodeRef.current.frequency.exponentialRampToValueAtTime(freq, ctx.currentTime + 0.6);
    }
  };

  const stopOscillator = () => {
    if (oscillatorNodeRef.current) {
      try {
        oscillatorNodeRef.current.stop();
        oscillatorNodeRef.current.disconnect();
      } catch (e) {}
      oscillatorNodeRef.current = null;
    }
  };

  // Cleanup audio nodes on unmount
  useEffect(() => {
    return () => {
      stopOscillator();
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  // Canvas Drawing Loop (The Procedural Video Engine!)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particles: { x: number; y: number; vx: number; vy: number; r: number; alpha: number }[] = [];
    // Initialize 60 floating dust particles
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4 - 0.1, // drifting slightly up like warmth
        r: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.5 + 0.1
      });
    }

    let frameCount = 0;

    const draw = () => {
      frameCount++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!activeScene) {
        // Render seed instructions if no video plan active
        ctx.fillStyle = "#1c1917"; // Stone-900 background
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#a8a29e"; // Stone-400
        ctx.font = "italic 14px serif";
        ctx.textAlign = "center";
        ctx.fillText("Water the Soil and click 'Choreograph Video Storyboard' to grow the visual garden.", canvas.width / 2, canvas.height / 2);
        return;
      }

      const symState = activeScene.symbolicState;

      // 1. Draw Environment Background (Indie Film cinematic mood)
      // Determine base colors from chord or energy
      const isChord = symState.chordActive;
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      if (isChord) {
        // Amber flare / glow
        gradient.addColorStop(0, "#291b10");
        gradient.addColorStop(1, "#0f0b07");
      } else if (activeScene.literalDescription.toLowerCase().includes("outro") || activeScene.literalDescription.toLowerCase().includes("low")) {
        // Soft blue hour twilight
        gradient.addColorStop(0, "#0f172a");
        gradient.addColorStop(1, "#020617");
      } else {
        // Warm interior morning shadows
        gradient.addColorStop(0, "#272522");
        gradient.addColorStop(1, "#141311");
      }
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Draw BACKDOOR (Threshold portal)
      const doorState = symState.backdoor.toLowerCase();
      if (doorState !== "absent" && doorState !== "none") {
        const doorWidth = 80;
        const doorHeight = 160;
        const doorX = canvas.width / 2 - 140;
        const doorY = canvas.height / 2 - 70;

        // Draw door aperture (what's behind it: green orchard)
        ctx.fillStyle = "#0c1f10"; // Dark void inside doorway
        ctx.fillRect(doorX, doorY, doorWidth, doorHeight);

        // If door is open, show green orchard branches moving!
        if (doorState === "open" || doorState === "half-open" || doorState === "ajar") {
          ctx.save();
          // Clip to doorway
          ctx.beginPath();
          ctx.rect(doorX, doorY, doorWidth, doorHeight);
          ctx.clip();

          // Green vibrant orchard background glow
          const orchardGrad = ctx.createRadialGradient(doorX + 40, doorY + 80, 5, doorX + 40, doorY + 80, 80);
          orchardGrad.addColorStop(0, "#14532d");
          orchardGrad.addColorStop(1, "#052e16");
          ctx.fillStyle = orchardGrad;
          ctx.fillRect(doorX, doorY, doorWidth, doorHeight);

          // Render moving stylized leaf blobs
          ctx.fillStyle = "#22c55e";
          ctx.globalAlpha = 0.25;
          const wobble = Math.sin(frameCount * 0.02) * 5;
          ctx.beginPath();
          ctx.arc(doorX + 30 + wobble, doorY + 40, 20, 0, Math.PI * 2);
          ctx.arc(doorX + 60 - wobble, doorY + 60, 25, 0, Math.PI * 2);
          ctx.arc(doorX + 25 + wobble * 0.5, doorY + 110, 15, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // Draw door frame
        ctx.strokeStyle = "#44403c"; // stone-700
        ctx.lineWidth = 4;
        ctx.strokeRect(doorX, doorY, doorWidth, doorHeight);

        // Draw door panel depending on state
        ctx.fillStyle = "#1c1917"; // stone-900 heavy wood
        ctx.strokeStyle = "#2e2b28";
        ctx.lineWidth = 2;
        if (doorState === "closed") {
          ctx.fillRect(doorX, doorY, doorWidth, doorHeight);
          ctx.strokeRect(doorX, doorY, doorWidth, doorHeight);
        } else if (doorState === "ajar") {
          // Semi-closed, angled door card
          ctx.fillRect(doorX, doorY, doorWidth * 0.7, doorHeight);
          ctx.strokeRect(doorX, doorY, doorWidth * 0.7, doorHeight);
        } else if (doorState === "half-open") {
          ctx.fillRect(doorX, doorY, doorWidth * 0.4, doorHeight);
          ctx.strokeRect(doorX, doorY, doorWidth * 0.4, doorHeight);
        } else if (doorState === "open") {
          // Just wood thickness edge on the left
          ctx.fillRect(doorX - 10, doorY, 14, doorHeight);
          ctx.strokeRect(doorX - 10, doorY, 14, doorHeight);
        }
      }

      // 3. Draw TABLE (Shared Context Surface)
      const tableState = symState.table.toLowerCase();
      const tableY = canvas.height - 75;
      if (tableState !== "absent" && tableState !== "no table visible") {
        // Wood tabletop plate
        ctx.fillStyle = "#292524"; // stone-800 wood
        ctx.beginPath();
        ctx.moveTo(30, tableY);
        ctx.lineTo(canvas.width - 30, tableY);
        ctx.lineTo(canvas.width - 10, canvas.height - 5);
        ctx.lineTo(10, canvas.height - 5);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = "#44403c"; // stone-700 lip
        ctx.lineWidth = 3;
        ctx.stroke();

        // Shuddering effect under "high" energy / chord trigger
        if (isChord) {
          ctx.save();
          ctx.translate(0, (Math.random() - 0.5) * 1.5);
        }
      }

      // 4. Draw SPOON (Attention watch object)
      const spoonState = symState.spoon.toLowerCase();
      if (spoonState !== "absent" && spoonState !== "absent from scene" && spoonState !== "none") {
        ctx.save();
        
        // Spoon coordinate: rests on table or inside drawer
        let spoonX = canvas.width / 2 + 110;
        let spoonY = tableY - 12;

        if (spoonState.includes("drawer")) {
          // Draw drawer box
          ctx.fillStyle = "#1c1917";
          ctx.fillRect(canvas.width / 2 + 90, tableY + 5, 80, 25);
          ctx.strokeStyle = "#44403c";
          ctx.strokeRect(canvas.width / 2 + 90, tableY + 5, 80, 25);
          
          spoonX = canvas.width / 2 + 130;
          spoonY = tableY + 15;
        }

        // Draw minimal silver Spoon (handle and head)
        ctx.shadowColor = "#000";
        ctx.shadowBlur = 4;
        ctx.shadowOffsetY = 2;

        const wobbleSpoon = Math.sin(frameCount * 0.01) * 0.05; // slight thermal draft breeze wobble
        ctx.translate(spoonX, spoonY);
        ctx.rotate(0.3 + wobbleSpoon);

        // Spoon head oval
        ctx.fillStyle = "#94a3b8"; // slate-400 silver metal
        ctx.beginPath();
        ctx.ellipse(0, 0, 10, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Spoon highlight
        ctx.fillStyle = "#f1f5f9"; // silver white gleam
        ctx.beginPath();
        ctx.ellipse(-3, -2, 4, 2, 0.4, 0, Math.PI * 2);
        ctx.fill();

        // Spoon handle stem
        ctx.strokeStyle = "#94a3b8";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(10, 0);
        ctx.quadraticCurveTo(25, -2, 40, -1);
        ctx.stroke();

        // Spoon handle end round nub
        ctx.fillStyle = "#94a3b8";
        ctx.beginPath();
        ctx.arc(41, -1, 1.8, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // 5. Draw DUST particles (Memory traces)
      const dustState = symState.dust.toLowerCase();
      if (dustState !== "clear air" && dustState !== "none") {
        const isDancing = dustState.includes("dancing") || isChord;
        
        particles.forEach((p) => {
          // Draw particle
          ctx.fillStyle = isChord ? "#fcd34d" : "#f5f5f4"; // golden spark if chord active
          ctx.globalAlpha = p.alpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r + (isDancing ? 0.8 : 0), 0, Math.PI * 2);
          ctx.fill();

          // Move particle
          const multiplier = isDancing ? 3.5 : 1.0;
          p.x += p.vx * multiplier;
          p.y += p.vy * multiplier;

          // Wrap boundaries
          if (p.x < 0) p.x = canvas.width;
          if (p.x > canvas.width) p.x = 0;
          if (p.y < 0) p.y = canvas.height;
          if (p.y > canvas.height) p.y = 0;
        });
        ctx.globalAlpha = 1.0; // Restore
      }

      // 6. Draw 022100 EVENT CHORD static flashes and radial glow
      if (isChord) {
        // Soft yellow vignette pulse
        const pulse = Math.abs(Math.sin(frameCount * 0.08)) * 0.2;
        ctx.fillStyle = `rgba(251, 191, 36, ${pulse})`; // Amber-400
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Noise static sparks lines
        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
          const sy = Math.random() * canvas.height;
          ctx.beginPath();
          ctx.moveTo(0, sy);
          ctx.lineTo(canvas.width, sy + (Math.random() - 0.5) * 40);
          ctx.stroke();
        }
      }

      // 7. Draw Cinema Letterbox black bars
      ctx.fillStyle = "#000000";
      const barHeight = 40;
      ctx.fillRect(0, 0, canvas.width, barHeight);
      ctx.fillRect(0, canvas.height - barHeight, canvas.width, barHeight);

      // 8. Draw Co-Witness Serene Subtitle Overlays (Typography)
      if (activeScene.overlayQuestion) {
        ctx.fillStyle = "#f5f5f4"; // soft off-white
        ctx.font = "italic 13px serif";
        ctx.textAlign = "center";
        ctx.fillText(activeScene.overlayQuestion, canvas.width / 2, canvas.height - 18);
      }

      // 9. Draw current song lyrics faint translucent lettering
      const currentLyricMatch = activeScene.literalDescription.match(/"([^"]+)"/);
      if (currentLyricMatch && currentLyricMatch[1]) {
        ctx.fillStyle = "rgba(168, 162, 158, 0.35)"; // stone-400 very transparent
        ctx.font = "normal tracking-widest 10px monospace";
        ctx.textAlign = "center";
        ctx.fillText(currentLyricMatch[1].toUpperCase(), canvas.width / 2, 24);
      }

      if (isChord) {
        ctx.restore(); // restore table shake if any
      }

      // Request next frame
      requestRef.current = requestAnimationFrame(draw);
    };

    // Begin drawing
    draw();

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [currentSceneIndex, activeScene]);

  // Click on timeline segment to jump playhead
  const handleTimelineClick = (idx: number) => {
    let acc = 0;
    for (let i = 0; i < idx; i++) {
      acc += storyboard[i].duration;
    }
    setCurrentTime(acc + 0.1);
    onSceneChange(idx);
  };

  const togglePlay = () => {
    // Resume audio context if suspended
    if (!isPlaying) {
      initAudio();
      if (audioCtxRef.current?.state === "suspended") {
        audioCtxRef.current.resume();
      }
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="bg-stone-950 rounded-2xl p-6 border border-stone-800 shadow-xl flex flex-col h-full text-stone-100">
      {/* Visual Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-stone-300">
              Co-Witness Viewport
            </h3>
            <p className="text-[10px] font-mono text-stone-500">
              {activeScene ? `Rendering Sequence [${activeScene.timestamp}]` : "Soil Unseeded"}
            </p>
          </div>
        </div>

        {activeScene?.symbolicState.chordActive && (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-950 border border-amber-700/50 text-[10px] font-mono text-amber-300 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            022100 TRIGGERED
          </div>
        )}
      </div>

      {/* Screen Canvas Container */}
      <div className="relative aspect-video bg-stone-900 rounded-xl overflow-hidden border border-stone-800 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={640}
          height={360}
          className="w-full h-full object-contain cursor-pointer"
          onClick={togglePlay}
        />

        {/* Ambient Overlay Vignette */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-stone-950/20 via-transparent to-stone-950/20 shadow-inner" />
      </div>

      {/* Play Controls bar */}
      <div className="flex items-center gap-4 mt-4 bg-stone-900/80 border border-stone-800/80 p-3 rounded-xl">
        <button
          onClick={togglePlay}
          className="p-2 bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-white rounded-lg transition-all"
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
        </button>

        {/* Playhead Progress Tracker */}
        <div className="flex-1 flex flex-col">
          <div className="flex justify-between text-[10px] font-mono text-stone-400 mb-1">
            <span>{currentTime.toFixed(1)}s</span>
            <span>{totalDuration.toFixed(1)}s</span>
          </div>
          <div className="w-full bg-stone-800 h-1.5 rounded-full relative overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-100"
              style={{ width: `${(currentTime / totalDuration) * 100}%` }}
            />
          </div>
        </div>

        <button
          onClick={() => setIsMuted(!isMuted)}
          className="p-2 text-stone-400 hover:text-stone-100 transition-colors"
          title={isMuted ? "Unmute Synthesizer" : "Mute Synthesizer"}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>
      </div>

      {/* Multi-Track Storyboard Timeline blocks scrubbing */}
      <div className="mt-5">
        <span className="text-[10px] font-mono text-stone-500 uppercase tracking-wider block mb-2">Choreographic Timeline Blocks</span>
        <div className="flex gap-1 bg-stone-900 border border-stone-800 rounded-xl p-2.5 overflow-x-auto">
          {storyboard.map((shot, idx) => {
            const isActive = idx === currentSceneIndex;
            return (
              <button
                key={idx}
                onClick={() => handleTimelineClick(idx)}
                className={`flex-1 min-w-[70px] text-left p-2 rounded-lg font-mono text-[10px] transition-all border ${
                  isActive
                    ? "bg-stone-800 text-emerald-400 border-emerald-600/50 shadow-md"
                    : "bg-stone-950/40 text-stone-500 hover:text-stone-300 border-stone-900"
                }`}
              >
                <span className="font-bold block truncate text-[9px] uppercase tracking-wide text-stone-400">{shot.timestamp}</span>
                <span className="text-[8px] italic opacity-80 block truncate">
                  {shot.symbolicState.backdoor !== "closed" ? `🚪 ${shot.symbolicState.backdoor}` : "🚪 closed"}
                </span>
                <span className="text-[8px] opacity-60 block truncate">
                  {shot.symbolicState.spoon.includes("drawer") ? "🥄 drawer" : shot.symbolicState.spoon !== "absent from scene" ? "🥄 table" : "🥄 absent"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Scene Description and AI Prompts info */}
      {activeScene && (
        <div className="mt-5 bg-stone-900/50 border border-stone-800/80 rounded-xl p-4">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-mono text-stone-400">Scene {currentSceneIndex + 1} Metadata</span>
            <button
              onClick={() => setShowPromptDetails(!showPromptDetails)}
              className="text-[10px] font-mono hover:underline text-emerald-400"
            >
              {showPromptDetails ? "Hide shot prompt" : "Show shot prompt"}
            </button>
          </div>

          <h4 className="text-xs font-mono font-semibold text-stone-200">Literal Narrative:</h4>
          <p className="text-xs font-sans text-stone-300 italic mb-3.5 mt-1 leading-relaxed">
            {activeScene.literalDescription}
          </p>

          <h4 className="text-xs font-mono font-semibold text-stone-200">Ontology DSL:</h4>
          <div className="grid grid-cols-2 gap-2 mt-1 mb-3.5 font-mono text-[10px] bg-stone-950/50 p-2.5 rounded border border-stone-800/50">
            <div>• Spoon: <span className="text-stone-300">{activeScene.symbolicState.spoon}</span></div>
            <div>• Dust: <span className="text-stone-300">{activeScene.symbolicState.dust}</span></div>
            <div>• Table: <span className="text-stone-300">{activeScene.symbolicState.table}</span></div>
            <div>• Door: <span className="text-stone-300">{activeScene.symbolicState.backdoor}</span></div>
          </div>

          {showPromptDetails && (
            <div className="mt-2 pt-2 border-t border-stone-800">
              <h4 className="text-xs font-mono font-semibold text-stone-200">Veo / Stable Video Prompt:</h4>
              <p className="text-[10px] font-mono text-stone-400 bg-stone-950 p-2 rounded mt-1 overflow-x-auto select-all">
                {activeScene.shotPrompt}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
