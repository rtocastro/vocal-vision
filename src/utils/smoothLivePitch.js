export function smoothLivePitch(
  frequencies,
  sampleCount = 3
) {
  if (
    !Array.isArray(frequencies) ||
    frequencies.length === 0
  ) {
    return null;
  }

  const valid = frequencies
    .filter(
      (frequency) =>
        Number.isFinite(frequency) &&
        frequency > 0
    )
    .slice(-sampleCount);

  if (!valid.length) {
    return null;
  }

  const sorted =
    [...valid].sort((a, b) => a - b);

  const middle =
    Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (
      sorted[middle - 1] +
      sorted[middle]
    ) / 2;
  }

  return sorted[middle];
}