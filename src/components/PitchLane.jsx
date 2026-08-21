import { frequencyToMidi } from "../utils/frequencyToNote";

function PitchLane({
    segments,
    currentTime,
    liveFrequency,
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

    const midiValues =
        visibleSegments.flatMap((segment) => [
            segment.minMidi,
            segment.maxMidi,
            segment.averageMidi,
        ]);

    let minMidi = Math.floor(
        Math.min(...midiValues)
    );

    let maxMidi = Math.ceil(
        Math.max(...midiValues)
    );

    const liveMidi =
        Number.isFinite(liveFrequency)
            ? frequencyToMidi(liveFrequency)
            : null;

    // The TARGET melody defines the viewport.
    // Give it extra breathing room above and below.
    minMidi -= 2;
    maxMidi += 2;

    const midiRange =
        Math.max(maxMidi - minMidi, 1);

    const timeToX = (time) =>
        ((time - startTime) /
            totalWindow) *
        100;

    const midiToY = (midiValue) =>
        100 -
        ((midiValue - minMidi) /
            midiRange) *
        100;

    const nowX =
        (pastWindow /
            totalWindow) *
        100;

    const rawLiveY =
        Number.isFinite(liveMidi)
            ? midiToY(liveMidi)
            : null;

    const liveY =
        Number.isFinite(rawLiveY)
            ? Math.max(
                3,
                Math.min(97, rawLiveY)
            )
            : null;

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