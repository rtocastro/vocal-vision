function PitchReadout({
  frequency,
  note,
  cents,
  isMicActive,
}) {
  const hasPitch =
    isMicActive &&
    frequency &&
    note &&
    Number.isFinite(cents);

  return (
    <section className="pitch-readout">
      <p className="section-label">
        LIVE PITCH
      </p>

      <div className="note-display">
        {hasPitch ? note : "—"}
      </div>

      <div className="frequency-display">
        {hasPitch
          ? `${frequency.toFixed(1)} Hz`
          : "—"}
      </div>

      <div className="cents-display">
        {hasPitch
          ? `${cents >= 0 ? "+" : ""}${cents.toFixed(
              1
            )} cents`
          : ""}
      </div>

      <p className="pitch-helper">
        {!isMicActive
          ? "Enable the microphone to begin."
          : hasPitch
            ? "Pitch detected"
            : "Sing or hum a steady note..."}
      </p>
    </section>
  );
}

export default PitchReadout;