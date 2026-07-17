import { SunoSection } from "./types";

export interface LyricPreset {
  id: string;
  title: string;
  author: string;
  lyrics: string;
  sunoSections: SunoSection[];
  activeMotifs: string[];
}

export const LYRIC_PRESETS: LyricPreset[] = [
  {
    id: "preset-static",
    title: "Static on the Glass",
    author: "Autodiscography (Historical Archive)",
    lyrics: `A backdoor half-open to the quiet orchard
A tarnished spoon resting on the empty kitchen table
Dust settling silently in the stray morning light
No words left, only the hum of static on the glass
A chord rings out at zero-two-two-one-zero-zero
We returned to see what remains when the evaluate has stopped.`,
    sunoSections: [
      { label: "Intro - Morning Hiss", start: 0, end: 12, energy: "low" },
      { label: "Build - Wind Entering", start: 12, end: 28, energy: "medium" },
      { label: "Drop - Chord Rings Out (022100)", start: 28, end: 44, energy: "high" },
      { label: "Refrain - Kitchen Table", start: 44, end: 60, energy: "medium" },
      { label: "Bridge - Unread Memory", start: 60, end: 80, energy: "high" },
      { label: "Outro - Deep Silence", start: 80, end: 96, energy: "low" }
    ],
    activeMotifs: ["spoon", "dust", "table", "backdoor", "022100"]
  },
  {
    id: "preset-orchard",
    title: "Suno Track #22100 - Orchard in Bloom",
    author: "Suno Seed (AI Foreign Source)",
    lyrics: `The grass is unmeasured, the trees grow without eyes
A heavy yellow light spills over the boundary door
The backdoor is open, let the silence rush inside
Every grain of dust is a library waiting to read
The silver spoon caught on the doorframe
022100, the marker of the returned ones.`,
    sunoSections: [
      { label: "Intro - Seed Haze", start: 0, end: 15, energy: "low" },
      { label: "Build - Sun Spilling", start: 15, end: 30, energy: "medium" },
      { label: "Chorus - Open Threshold", start: 30, end: 55, energy: "high" },
      { label: "Verse - Dust Spores", start: 55, end: 75, energy: "low" },
      { label: "Drop - 022100 Flash", start: 75, end: 95, energy: "high" },
      { label: "Outro - Quiet Ash", start: 95, end: 110, energy: "low" }
    ],
    activeMotifs: ["dust", "backdoor", "022100"]
  },
  {
    id: "preset-custom",
    title: "Custom Garden Script",
    author: "Gardener",
    lyrics: `The shared table holds the context we built.
A single backdoor stands tall at the boundary.
Water the soil with attention.
The spoon watches quietly.`,
    sunoSections: [
      { label: "A - Seeds", start: 0, end: 10, energy: "low" },
      { label: "B - Shoots", start: 10, end: 25, energy: "medium" },
      { label: "C - Blooms", start: 25, end: 45, energy: "high" }
    ],
    activeMotifs: ["spoon", "table"]
  }
];
