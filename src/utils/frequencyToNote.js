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

export function frequencyToNote(frequency) {
  if (!frequency || frequency <= 0) {
    return null;
  }

  const midiNumber =
    69 + 12 * Math.log2(frequency / 440);

  const roundedMidi = Math.round(midiNumber);

  const noteIndex =
    ((roundedMidi % 12) + 12) % 12;

  const octave =
    Math.floor(roundedMidi / 12) - 1;

  return {
    note: NOTE_NAMES[noteIndex],
    octave,
    midiNumber: roundedMidi,
    label: `${NOTE_NAMES[noteIndex]}${octave}`,
  };
}