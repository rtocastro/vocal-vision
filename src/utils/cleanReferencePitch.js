import { frequencyToMidi } from "./frequencyToNote";

function median(values) {
  if (!values.length) {
    return null;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (
      (sorted[middle - 1] + sorted[middle]) / 2
    );
  }

  return sorted[middle];
}

function midiToFrequency(midiValue) {
  return (
    440 *
    Math.pow(
      2,
      (midiValue - 69) / 12
    )
  );
}

export function cleanReferencePitch(
  pitchData,
  {
    smoothingRadius = 2,
    spikeThreshold = 4.5,
    maxGapFrames = 3,
    bridgeDistance = 2,
  } = {}
) {
  if (!pitchData?.length) {
    return [];
  }

  // Convert frequencies into continuous MIDI values.
  // Continuous MIDI makes musical-distance calculations
  // much easier than comparing raw Hz.
  const workingData = pitchData.map((point) => ({
    ...point,
    rawFrequency: point.frequency,
    midiValue: point.frequency
      ? frequencyToMidi(point.frequency)
      : null,
  }));

  // --------------------------------------------------
  // PASS 1:
  // Remove obvious isolated pitch spikes.
  // --------------------------------------------------

  const despikedData = workingData.map(
    (point, index) => {
      if (point.midiValue === null) {
        return { ...point };
      }

      const nearbyValues = [];

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
          neighbor.midiValue !== null
        ) {
          nearbyValues.push(
            neighbor.midiValue
          );
        }
      }

      if (nearbyValues.length < 2) {
        return { ...point };
      }

      const nearbyMedian =
        median(nearbyValues);

      const distance = Math.abs(
        point.midiValue - nearbyMedian
      );

      // A sudden isolated jump of several semitones is
      // probably a detection error rather than the melody.
      if (distance > spikeThreshold) {
        return {
          ...point,
          midiValue: nearbyMedian,
          correctedSpike: true,
        };
      }

      return { ...point };
    }
  );

  // --------------------------------------------------
  // PASS 2:
  // Bridge only very short silent / missed gaps.
  // --------------------------------------------------

  const bridgedData = despikedData.map(
    (point) => ({ ...point })
  );

  let index = 0;

  while (index < bridgedData.length) {
    if (
      bridgedData[index].midiValue !== null
    ) {
      index += 1;
      continue;
    }

    const gapStart = index;

    while (
      index < bridgedData.length &&
      bridgedData[index].midiValue === null
    ) {
      index += 1;
    }

    const gapEnd = index - 1;
    const gapLength =
      gapEnd - gapStart + 1;

    const before =
      bridgedData[gapStart - 1];

    const after =
      bridgedData[index];

    if (
      gapLength <= maxGapFrames &&
      before?.midiValue !== null &&
      before?.midiValue !== undefined &&
      after?.midiValue !== null &&
      after?.midiValue !== undefined
    ) {
      const pitchDistance = Math.abs(
        after.midiValue -
          before.midiValue
      );

      // Only bridge the gap when both sides belong
      // reasonably close to the same melodic area.
      if (
        pitchDistance <= bridgeDistance
      ) {
        for (
          let gapIndex = gapStart;
          gapIndex <= gapEnd;
          gapIndex += 1
        ) {
          const progress =
            (gapIndex -
              gapStart +
              1) /
            (gapLength + 1);

          const interpolatedMidi =
            before.midiValue +
            (after.midiValue -
              before.midiValue) *
              progress;

          bridgedData[
            gapIndex
          ].midiValue =
            interpolatedMidi;

          bridgedData[
            gapIndex
          ].bridgedGap = true;
        }
      }
    }
  }

  // --------------------------------------------------
  // PASS 3:
  // Apply a small median filter.
  //
  // This removes tiny frame-to-frame wobble without
  // aggressively averaging real note changes together.
  // --------------------------------------------------

  const smoothedData = bridgedData.map(
    (point, pointIndex) => {
      if (point.midiValue === null) {
        return {
          ...point,
          frequency: null,
        };
      }

      const neighborhood = [];

      for (
        let offset = -smoothingRadius;
        offset <= smoothingRadius;
        offset += 1
      ) {
        const neighbor =
          bridgedData[
            pointIndex + offset
          ];

        if (
          neighbor &&
          neighbor.midiValue !== null
        ) {
          neighborhood.push(
            neighbor.midiValue
          );
        }
      }

      const smoothedMidi =
        median(neighborhood);

      return {
        ...point,
        midiValue: smoothedMidi,
        frequency:
          midiToFrequency(
            smoothedMidi
          ),
      };
    }
  );

  return smoothedData;
}