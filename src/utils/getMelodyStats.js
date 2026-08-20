export function getMelodyStats(pitchData) {
  if (!pitchData?.length) {
    return {
      total: 0,
      detected: 0,
      correctedSpikes: 0,
      bridgedGaps: 0,
    };
  }

  return {
    total: pitchData.length,

    detected: pitchData.filter(
      (point) =>
        Number.isFinite(
          point.frequency
        )
    ).length,

    correctedSpikes:
      pitchData.filter(
        (point) =>
          point.correctedSpike
      ).length,

    bridgedGaps:
      pitchData.filter(
        (point) =>
          point.bridgedGap
      ).length,
  };
}