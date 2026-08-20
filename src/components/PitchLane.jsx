import { frequencyToMidi } from "../utils/frequencyToNote";

function PitchLane({
  pitchData,
  currentTime,
  liveFrequency,
  isPlaying,
}) {
  const pastWindow = 2;
  const futureWindow = 3;
  const totalWindow = pastWindow + futureWindow;

  const startTime = currentTime - pastWindow;
  const endTime = currentTime + futureWindow;

  const visiblePoints = pitchData.filter(
    (point) =>
      Number.isFinite(point.frequency) &&
      point.time >= startTime &&
      point.time <= endTime
  );

  const midiPoints = visiblePoints
    .map((point) => ({
      ...point,
      midiValue: frequencyToMidi(point.frequency),
    }))
    .filter((point) =>
      Number.isFinite(point.midiValue)
    );

  if (!midiPoints.length) {
    return (
      <section className="pitch-lane">
        <div className="pitch-lane-header">
          <div>
            <p className="section-label">
              TARGET MELODY
            </p>
            <h2>Pitch Lane</h2>
          </div>
        </div>

        <div className="pitch-lane-empty">
          {isPlaying
            ? "Waiting for reference pitch..."
            : "Play the instrumental to view the melody."}
        </div>
      </section>
    );
  }

  const midiValues = midiPoints.map(
    (point) => point.midiValue
  );

  let minMidi = Math.floor(
    Math.min(...midiValues)
  );

  let maxMidi = Math.ceil(
    Math.max(...midiValues)
  );

  if (Number.isFinite(liveFrequency)) {
    const liveMidi =
      frequencyToMidi(liveFrequency);

    if (Number.isFinite(liveMidi)) {
      minMidi = Math.min(
        minMidi,
        Math.floor(liveMidi)
      );

      maxMidi = Math.max(
        maxMidi,
        Math.ceil(liveMidi)
      );
    }
  }

  // Add breathing room above and below melody.
  minMidi -= 1;
  maxMidi += 1;

  const midiRange =
    Math.max(maxMidi - minMidi, 1);

  const timeToX = (time) => {
    return (
      ((time - startTime) / totalWindow) *
      100
    );
  };

  const midiToY = (midiValue) => {
    return (
      100 -
      ((midiValue - minMidi) / midiRange) *
        100
    );
  };

  const nowX =
    (pastWindow / totalWindow) * 100;

  const liveMidi =
    Number.isFinite(liveFrequency)
      ? frequencyToMidi(liveFrequency)
      : null;

  const liveY =
    Number.isFinite(liveMidi)
      ? midiToY(liveMidi)
      : null;

  const segments = [];

  let currentSegment = null;

  for (const point of midiPoints) {
    const roundedNote = Math.round(
      point.midiValue
    );

    if (
      !currentSegment ||
      currentSegment.note !== roundedNote
    ) {
      if (currentSegment) {
        segments.push(currentSegment);
      }

      currentSegment = {
        note: roundedNote,
        startTime: point.time,
        endTime: point.time,
        midiValue: point.midiValue,
      };
    } else {
      currentSegment.endTime = point.time;
    }
  }

  if (currentSegment) {
    segments.push(currentSegment);
  }

  return (
    <section className="pitch-lane">
      <div className="pitch-lane-header">
        <div>
          <p className="section-label">
            TARGET MELODY
          </p>
          <h2>Pitch Lane</h2>
        </div>

        <span className="pitch-lane-window">
          5 SEC VIEW
        </span>
      </div>

      <div className="pitch-lane-grid">
        <div
          className="pitch-lane-now"
          style={{
            left: `${nowX}%`,
          }}
        >
          <span>NOW</span>
        </div>

        {segments.map((segment, index) => {
          const left = timeToX(
            segment.startTime
          );

          const right = timeToX(
            segment.endTime
          );

          const width = Math.max(
            right - left,
            0.5
          );

          const y = midiToY(
            segment.midiValue
          );

          return (
            <div
              key={`${segment.startTime}-${index}`}
              className="target-note-segment"
              style={{
                left: `${left}%`,
                width: `${width}%`,
                top: `${y}%`,
              }}
            />
          );
        })}

        {Number.isFinite(liveY) && (
          <div
            className="live-pitch-dot"
            style={{
              left: `${nowX}%`,
              top: `${liveY}%`,
            }}
          />
        )}
      </div>

      <div className="pitch-lane-footer">
        <span>-2s</span>
        <span>NOW</span>
        <span>+3s</span>
      </div>
    </section>
  );
}

export default PitchLane;