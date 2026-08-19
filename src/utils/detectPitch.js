export function detectPitch(buffer, sampleRate) {
  const size = buffer.length;

  let rms = 0;

  for (let i = 0; i < size; i += 1) {
    const value = buffer[i];
    rms += value * value;
  }

  rms = Math.sqrt(rms / size);

  // Ignore signals that are effectively silence.
  if (rms < 0.01) {
    return null;
  }

  let start = 0;
  let end = size - 1;

  const threshold = 0.2;

  for (let i = 0; i < size / 2; i += 1) {
    if (Math.abs(buffer[i]) < threshold) {
      start = i;
      break;
    }
  }

  for (let i = 1; i < size / 2; i += 1) {
    if (Math.abs(buffer[size - i]) < threshold) {
      end = size - i;
      break;
    }
  }

  const trimmedBuffer = buffer.slice(start, end);
  const trimmedSize = trimmedBuffer.length;

  const correlations = new Array(trimmedSize).fill(0);

  for (let lag = 0; lag < trimmedSize; lag += 1) {
    for (
      let index = 0;
      index < trimmedSize - lag;
      index += 1
    ) {
      correlations[lag] +=
        trimmedBuffer[index] *
        trimmedBuffer[index + lag];
    }
  }

  let dip = 0;

  while (
    dip + 1 < correlations.length &&
    correlations[dip] > correlations[dip + 1]
  ) {
    dip += 1;
  }

  let maxValue = -1;
  let maxIndex = -1;

  for (let i = dip; i < correlations.length; i += 1) {
    if (correlations[i] > maxValue) {
      maxValue = correlations[i];
      maxIndex = i;
    }
  }

  if (maxIndex <= 0) {
    return null;
  }

  let period = maxIndex;

  // Small interpolation step for better frequency accuracy.
  if (
    maxIndex > 0 &&
    maxIndex < correlations.length - 1
  ) {
    const left = correlations[maxIndex - 1];
    const center = correlations[maxIndex];
    const right = correlations[maxIndex + 1];

    const denominator =
      left - 2 * center + right;

    if (denominator !== 0) {
      const adjustment =
        0.5 * (left - right) / denominator;

      period += adjustment;
    }
  }

  const frequency = sampleRate / period;

  // Keep the first vocal prototype in a useful range.
  if (
    !Number.isFinite(frequency) ||
    frequency < 60 ||
    frequency > 1200
  ) {
    return null;
  }

  return frequency;
}