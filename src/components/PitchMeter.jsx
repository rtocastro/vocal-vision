function PitchMeter({
  note,
  cents,
  isMicActive,
}) {
  const hasPitch =
    isMicActive &&
    note &&
    Number.isFinite(cents);

  const clampedCents = hasPitch
    ? Math.max(-50, Math.min(50, cents))
    : 0;

  const position = ((clampedCents + 50) / 100) * 100;

  const IN_TUNE_THRESHOLD = 12;

  let status = "WAITING";
  let direction = "";

  if (hasPitch) {
    if (Math.abs(cents) <= IN_TUNE_THRESHOLD) {
      status = "IN TUNE";
      direction = "✓";
    } else if (cents < -10) {
      status = "FLAT";
      direction = "↑ SING HIGHER";
    } else {
      status = "SHARP";
      direction = "↓ SING LOWER";
    }
  }

  return (
    <section className="pitch-meter">
      <div className="pitch-meter-header">
        <div>
          <p className="section-label">
            VOCAL POSITION
          </p>

          <h2>
            {hasPitch ? note : "Waiting for pitch"}
          </h2>
        </div>

        <span
          className={`tuning-status ${
            hasPitch
              ? Math.abs(cents) <= IN_TUNE_THRESHOLD
                ? "in-tune"
                : "out-of-tune"
              : ""
          }`}
        >
          {status}
        </span>
      </div>

      <div className="meter-labels">
        <span>FLAT</span>
        <span>IN TUNE</span>
        <span>SHARP</span>
      </div>

      <div className="meter-track">
        <div className="meter-center" />

        {hasPitch && (
          <div
            className="meter-indicator"
            style={{
              left: `${position}%`,
            }}
          />
        )}
      </div>

      <div className="meter-scale">
        <span>-50</span>
        <span>-25</span>
        <span>0</span>
        <span>+25</span>
        <span>+50</span>
      </div>

      <div className="pitch-direction">
        {hasPitch ? direction : "Sing a steady note"}
      </div>

      {hasPitch && (
        <div className="pitch-cents">
          {cents >= 0 ? "+" : ""}
          {cents.toFixed(1)} cents
        </div>
      )}
    </section>
  );
}

export default PitchMeter;