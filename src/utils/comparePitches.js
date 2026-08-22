export function comparePitches(
  liveFrequency,
  targetFrequency,
  toleranceCents = 15
) {
  if (
    !Number.isFinite(liveFrequency) ||
    !Number.isFinite(targetFrequency) ||
    liveFrequency <= 0 ||
    targetFrequency <= 0
  ) {
    return null;
  }

  const centsDifference =
    1200 *
    Math.log2(
      liveFrequency / targetFrequency
    );

  const absoluteCents =
    Math.abs(centsDifference);

  let status = "IN TUNE";
  let direction = "LOCKED";

  if (centsDifference < -toleranceCents) {
    status = "FLAT";
    direction = "SING HIGHER";
  } else if (
    centsDifference > toleranceCents
  ) {
    status = "SHARP";
    direction = "SING LOWER";
  }

  return {
    centsDifference,

    // Also expose this alias for future features.
    cents: centsDifference,

    absoluteCents,

    status,
    direction,

    toleranceCents,

    isInTune:
      absoluteCents <= toleranceCents,
  };
}