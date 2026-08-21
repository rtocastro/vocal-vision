import { frequencyToMidi } from "../utils/frequencyToNote";

const NOTE_NAMES = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
];

function midiToNoteLabel(midiNumber) {
    const noteIndex =
        ((midiNumber % 12) + 12) % 12;

    const octave =
        Math.floor(midiNumber / 12) - 1;

    return `${NOTE_NAMES[noteIndex]}${octave}`;
}

function PitchLane({
    segments,
    currentTime,
    liveFrequency,
    livePitchHistory = [],
    isPlaying,
}) {
    const pastWindow = 2;
    const futureWindow = 3;
    const totalWindow =
        pastWindow + futureWindow;

    const startTime =
        currentTime - pastWindow;

    const endTime =
        currentTime + futureWindow;

    const visibleSegments =
        segments.filter(
            (segment) =>
                segment.endTime >= startTime &&
                segment.startTime <= endTime
        );

    if (!visibleSegments.length) {
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

    // Use the entire song's target melody
    // to create one stable vertical viewport.
    const allMidiValues =
        segments.flatMap((segment) => [
            segment.minMidi,
            segment.maxMidi,
            segment.averageMidi,
        ]);

    let minMidi = Math.floor(
        Math.min(...allMidiValues)
    );

    let maxMidi = Math.ceil(
        Math.max(...allMidiValues)
    );

    // Give the overall vocal range some space.
    minMidi -= 1;
    maxMidi += 1;

    const midiRange =
        Math.max(
            maxMidi - minMidi,
            1
        );

    // Build one row per semitone.
    const noteRows = [];

    for (
        let midi = maxMidi;
        midi >= minMidi;
        midi -= 1
    ) {
        noteRows.push({
            midi,
            label: midiToNoteLabel(midi),
        });
    }

    const timeToX = (time) =>
        ((time - startTime) /
            totalWindow) *
        100;

    const midiToY = (midiValue) =>
        100 -
        ((midiValue - minMidi) /
            midiRange) *
        100;

    // NOW remains fixed at 40%:
    // 2 seconds behind / 3 seconds ahead.
    const nowX =
        (pastWindow /
            totalWindow) *
        100;

    // Convert the live microphone frequency
    // into the same MIDI coordinate system.
    const liveMidi =
        Number.isFinite(liveFrequency)
            ? frequencyToMidi(liveFrequency)
            : null;

    const rawLiveY =
        Number.isFinite(liveMidi)
            ? midiToY(liveMidi)
            : null;

    // Keep the live dot physically inside
    // the visible pitch lane.
    const liveY =
        Number.isFinite(rawLiveY)
            ? Math.max(
                3,
                Math.min(97, rawLiveY)
            )
            : null;


    const visibleLiveHistory =
        livePitchHistory
            .filter(
                (point) =>
                    Number.isFinite(point.frequency) &&
                    point.time >= startTime &&
                    point.time <= currentTime
            )
            .map((point) => {
                const midi =
                    frequencyToMidi(
                        point.frequency
                    );

                if (!Number.isFinite(midi)) {
                    return null;
                }

                const rawY =
                    midiToY(midi);

                const y =
                    Math.max(
                        3,
                        Math.min(97, rawY)
                    );

                return {
                    ...point,
                    x: timeToX(point.time),
                    y,
                };
            })
            .filter(Boolean);

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

            <div className="pitch-lane-body">
                {/* Label only C notes so the gutter
            stays readable across large ranges. */}
                <div className="pitch-note-labels">
                    {noteRows.map((row) => {
                        const noteName =
                            row.label.replace(
                                /[0-9-]/g,
                                ""
                            );

                        if (noteName !== "C") {
                            return null;
                        }

                        const y =
                            midiToY(row.midi);

                        return (
                            <span
                                key={row.midi}
                                style={{
                                    top: `${y}%`,
                                }}
                            >
                                {row.label}
                            </span>
                        );
                    })}
                </div>

                <div className="pitch-lane-grid">
                    {/* Keep every semitone grid line. */}
                    {noteRows.map((row) => {
                        const y =
                            midiToY(row.midi);

                        return (
                            <div
                                key={row.midi}
                                className="pitch-note-row"
                                style={{
                                    top: `${y}%`,
                                }}
                            />
                        );
                    })}

                    <div
                        className="pitch-lane-now"
                        style={{
                            left: `${nowX}%`,
                        }}
                    >
                        <span>NOW</span>
                    </div>

                    {visibleSegments.map(
                        (segment, index) => {
                            const left =
                                timeToX(
                                    segment.startTime
                                );

                            const right =
                                timeToX(
                                    segment.endTime
                                );

                            const width =
                                Math.max(
                                    right - left,
                                    0.8
                                );

                            const y =
                                midiToY(
                                    segment.averageMidi
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
                        }
                    )}

                    {visibleLiveHistory.length > 1 && (
                        <svg
                            className="live-pitch-trail"
                            viewBox="0 0 100 100"
                            preserveAspectRatio="none"
                        >
                            <polyline
                                points={visibleLiveHistory
                                    .map(
                                        (point) =>
                                            `${point.x},${point.y}`
                                    )
                                    .join(" ")}
                            />
                        </svg>
                    )}

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