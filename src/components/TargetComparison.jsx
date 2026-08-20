function TargetComparison({
  targetNote,
  targetFrequency,
  liveNote,
  liveFrequency,
  comparison,
  isPlaying,
  isMicActive,
}) {
  const hasTarget =
    Number.isFinite(targetFrequency);

  const hasLivePitch =
    Number.isFinite(liveFrequency);

  const canCompare =
    hasTarget &&
    hasLivePitch &&
    comparison;

  let helperText =
    "Play the instrumental to begin.";

  if (isPlaying && !hasTarget) {
    helperText =
      "Waiting for reference vocal...";
  }

  if (
    isPlaying &&
    hasTarget &&
    !isMicActive
  ) {
    helperText =
      "Enable your microphone to sing.";
  }

  if (
    isPlaying &&
    hasTarget &&
    isMicActive &&
    !hasLivePitch
  ) {
    helperText =
      "Sing the target note.";
  }

  return (
    <section className="target-comparison">
      <div className="comparison-header">
        <div>
          <p className="section-label">
            VOCAL MATCH
          </p>

          <h2>Target vs. You</h2>
        </div>

        {canCompare && (
          <span
            className={`comparison-status ${comparison.status
              .toLowerCase()
              .replace(" ", "-")}`}
          >
            {comparison.status}
          </span>
        )}
      </div>

      <div className="pitch-comparison-grid">
        <div className="comparison-column">
          <span className="comparison-label">
            TARGET
          </span>

          <strong className="comparison-note">
            {hasTarget
              ? targetNote
              : "—"}
          </strong>

          <span className="comparison-frequency">
            {hasTarget
              ? `${targetFrequency.toFixed(
                  1
                )} Hz`
              : "Waiting"}
          </span>
        </div>

        <div className="comparison-divider">
          VS
        </div>

        <div className="comparison-column">
          <span className="comparison-label">
            YOU
          </span>

          <strong className="comparison-note">
            {hasLivePitch
              ? liveNote
              : "—"}
          </strong>

          <span className="comparison-frequency">
            {hasLivePitch
              ? `${liveFrequency.toFixed(
                  1
                )} Hz`
              : "Waiting"}
          </span>
        </div>
      </div>

      {canCompare ? (
        <div className="comparison-feedback">
          <strong>
            {comparison.status === "FLAT" &&
              "↑ "}
            {comparison.status === "SHARP" &&
              "↓ "}
            {comparison.status === "IN TUNE" &&
              "✓ "}

            {comparison.direction}
          </strong>

          <span>
            {comparison.centsDifference >= 0
              ? "+"
              : ""}
            {comparison.centsDifference.toFixed(
              1
            )}{" "}
            cents from target
          </span>
        </div>
      ) : (
        <p className="comparison-helper">
          {helperText}
        </p>
      )}
    </section>
  );
}

export default TargetComparison;