export function findReferencePitch(
  pitchData,
  currentTime,
  tolerance = 0.12
) {
  if (
    !pitchData?.length ||
    !Number.isFinite(currentTime)
  ) {
    return null;
  }

  let closestPoint = null;
  let closestDistance = Infinity;

  for (const point of pitchData) {
    if (!point.frequency) continue;

    const distance = Math.abs(
      point.time - currentTime
    );

    if (distance < closestDistance) {
      closestDistance = distance;
      closestPoint = point;
    }
  }

  if (
    !closestPoint ||
    closestDistance > tolerance
  ) {
    return null;
  }

  return closestPoint;
}