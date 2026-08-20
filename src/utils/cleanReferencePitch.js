import { frequencyToMidi } from "./frequencyToNote";

function midiToFrequency(midiValue) {
  return 440 * Math.pow(2, (midiValue - 69) / 12);
}

function median(values) {
  if (!values.length) return null;

  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (
      sorted[middle - 1] + sorted[middle]
    ) / 2;
  }

  return sorted[middle];
}

export function cleanReferencePitch(
  pitchData,
  {
    smoothingRadius = 2,
    spikeThreshold = 4.5,
  } = {}
) {
  if (!Array.isArray(pitchData)) {
    return [];
  }

  if (pitchData.length === 0) {
    return [];
  }

  // Preserve the original timeline exactly.
  const workingData = pitchData.map((point) => ({
    ...point,

    rawFrequency:
      Number.isFinite(point.frequency)
        ? point.frequency
        : null,

    midiValue:
      Number.isFinite(point.frequency)
        ? frequencyToMidi(point.frequency)
        : null,

    correctedSpike: false,
    bridgedGap: false,
  }));

  return workingData.map((point, index) => {
    // Preserve real silence / undetected pitch.
    if (!Number.isFinite(point.midiValue)) {
      return {
        ...point,
        frequency: null,
      };
    }

    const neighbors = [];

    for (
      let offset = -smoothingRadius;
      offset <= smoothingRadius;
      offset += 1
    ) {
      if (offset === 0) continue;

      const neighbor =
        workingData[index + offset];

      if (
        neighbor &&
        Number.isFinite(neighbor.midiValue)
      ) {
        neighbors.push(neighbor.midiValue);
      }
    }

    // Not enough context? Keep original reading.
    if (neighbors.length < 2) {
      return {
        ...point,
        frequency: point.rawFrequency,
      };
    }

    const neighborMedian = median(neighbors);

    if (!Number.isFinite(neighborMedian)) {
      return {
        ...point,
        frequency: point.rawFrequency,
      };
    }

    const distance = Math.abs(
      point.midiValue - neighborMedian
    );

    // Only replace obvious isolated jumps.
    if (distance > spikeThreshold) {
      return {
        ...point,
        midiValue: neighborMedian,
        frequency: midiToFrequency(
          neighborMedian
        ),
        correctedSpike: true,
      };
    }

    // Otherwise preserve the real detected pitch.
    return {
      ...point,
      frequency: point.rawFrequency,
    };
  });
}