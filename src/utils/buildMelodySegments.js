import { frequencyToMidi } from "./frequencyToNote";

export function buildMelodySegments(
  pitchData,
  {
    minSegmentDuration = 0.08,
    noteTolerance = 0.6,
    maxGapDuration = 0.12,
  } = {}
) {
  if (!Array.isArray(pitchData) || !pitchData.length) {
    return [];
  }

  const points = pitchData
    .map((point) => ({
      ...point,
      midiValue: Number.isFinite(point.frequency)
        ? frequencyToMidi(point.frequency)
        : null,
    }))
    .filter((point) =>
      Number.isFinite(point.time)
    );

  const segments = [];

  let currentSegment = null;
  let lastValidPoint = null;

  for (const point of points) {
    const hasPitch = Number.isFinite(point.midiValue);

    if (!hasPitch) {
      if (
        currentSegment &&
        lastValidPoint &&
        point.time - lastValidPoint.time >
          maxGapDuration
      ) {
        finalizeSegment(
          segments,
          currentSegment,
          minSegmentDuration
        );

        currentSegment = null;
      }

      continue;
    }

    if (!currentSegment) {
      currentSegment = createSegment(point);
      lastValidPoint = point;
      continue;
    }

    const distanceFromCenter = Math.abs(
      point.midiValue - currentSegment.averageMidi
    );

    const timeGap =
      point.time - lastValidPoint.time;

    const samePitchRegion =
      distanceFromCenter <= noteTolerance;

    const gapIsSmall =
      timeGap <= maxGapDuration;

    if (samePitchRegion && gapIsSmall) {
      addPointToSegment(
        currentSegment,
        point
      );
    } else {
      finalizeSegment(
        segments,
        currentSegment,
        minSegmentDuration
      );

      currentSegment = createSegment(point);
    }

    lastValidPoint = point;
  }

  if (currentSegment) {
    finalizeSegment(
      segments,
      currentSegment,
      minSegmentDuration
    );
  }

  return segments;
}

function createSegment(point) {
  return {
    startTime: point.time,
    endTime: point.time,
    averageMidi: point.midiValue,
    minMidi: point.midiValue,
    maxMidi: point.midiValue,
    sampleCount: 1,
  };
}

function addPointToSegment(segment, point) {
  segment.endTime = point.time;
  segment.sampleCount += 1;

  segment.averageMidi =
    segment.averageMidi +
    (point.midiValue - segment.averageMidi) /
      segment.sampleCount;

  segment.minMidi = Math.min(
    segment.minMidi,
    point.midiValue
  );

  segment.maxMidi = Math.max(
    segment.maxMidi,
    point.midiValue
  );
}

function finalizeSegment(
  segments,
  segment,
  minSegmentDuration
) {
  const duration =
    segment.endTime - segment.startTime;

  if (duration < minSegmentDuration) {
    return;
  }

  segments.push({
    ...segment,
    duration,
    noteMidi: Math.round(
      segment.averageMidi
    ),
  });
}