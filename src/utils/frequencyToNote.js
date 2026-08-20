const NOTE_NAMES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

/**
 * Convert a frequency in Hz to its precise MIDI note value.
 *
 * Examples:
 * 440 Hz = 69
 * 261.63 Hz ≈ 60
 */
export function frequencyToMidi(frequency) {
  if (!frequency || frequency <= 0) {
    return null;
  }

  return 69 + 12 * Math.log2(frequency / 440);
}

/**
 * Convert a frequency into musical note information.
 */
export function frequencyToNote(frequency) {
  const midiValue = frequencyToMidi(frequency);

  if (midiValue === null) {
    return null;
  }

  const roundedMidi = Math.round(midiValue);

  const noteIndex =
    ((roundedMidi % 12) + 12) % 12;

  const octave =
    Math.floor(roundedMidi / 12) - 1;

  return {
    note: NOTE_NAMES[noteIndex],
    octave,
    midiNumber: roundedMidi,
    midiValue,
    label: `${NOTE_NAMES[noteIndex]}${octave}`,
  };
}