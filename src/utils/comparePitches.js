export function comparePitches(
  liveFrequency,
  targetFrequency,
  inTuneThreshold = 15
) {
  if (
    !liveFrequency ||
    !targetFrequency ||
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

  let status = "IN TUNE";
  let direction = "LOCKED";

  if (centsDifference < -inTuneThreshold) {
    status = "FLAT";
    direction = "SING HIGHER";
  } else if (
    centsDifference > inTuneThreshold
  ) {
    status = "SHARP";
    direction = "SING LOWER";
  }

  return {
    centsDifference,
    status,
    direction,
  };
}