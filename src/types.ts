export interface SunoSection {
  label: string;
  start: number;
  end: number;
  energy: "low" | "medium" | "high";
}

export interface SymbolicState {
  spoon: string;
  dust: string;
  table: string;
  backdoor: string; // 'closed' | 'half-open' | 'open' | 'ajar'
  chordActive: boolean;
}

export interface StoryboardShot {
  timestamp: string;
  duration: number;
  literalDescription: string;
  symbolicState: SymbolicState;
  shotPrompt: string;
  overlayQuestion: string;
  voices: {
    autodiscography: string;
    bananadash: string;
    aippy: string;
  };
}

export interface T5PipelineResponse {
  success: boolean;
  mode: string;
  layer1_output: string;
  layer2_output: string;
  layer3_output: string;
  storyboard: StoryboardShot[];
  error?: string;
}

export interface SoilEvent {
  id: string;
  timestamp: string;
  type: string;
  gardener: string;
  summary: string;
  nutrientDelta: number;
}

export interface GardenSeed {
  id: string;
  name: string;
  motif: string;
  germinated: boolean;
  level: number;
}

export interface SoilLedgerState {
  nutrientScore: number;
  gardenPhase: string;
  events: SoilEvent[];
  seeds: GardenSeed[];
}
