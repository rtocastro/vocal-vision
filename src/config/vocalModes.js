export const VOCAL_MODES = {
  clean: {
    id: "clean",
    label: "Clean",
    toleranceCents: 15,
    smoothingSamples: 3,
    description: "Precise pitch tracking for clean singing.",
  },

  hybrid: {
    id: "hybrid",
    label: "Hybrid",
    toleranceCents: 25,
    smoothingSamples: 5,
    description: "Balanced tracking for mixed vocal styles.",
  },

  scream: {
    id: "scream",
    label: "Scream",
    toleranceCents: 40,
    smoothingSamples: 8,
    description:
      "Relaxed tracking for fry, distorted, and harsh vocals.",
  },
};

export const DEFAULT_VOCAL_MODE = "clean";