function MicrophoneControl({
  isMicActive,
  micError,
  onStart,
  onStop,
}) {
  return (
    <section className="microphone-control">
      <div className="mic-header">
        <div>
          <p className="section-label">VOCAL INPUT</p>
          <h2>Microphone</h2>
        </div>

        <span
          className={`mic-status ${
            isMicActive ? "active" : ""
          }`}
        >
          {isMicActive ? "MIC ACTIVE" : "MIC OFF"}
        </span>
      </div>

      <button
        type="button"
        className="mic-button"
        onClick={isMicActive ? onStop : onStart}
      >
        {isMicActive
          ? "Stop Microphone"
          : "Enable Microphone"}
      </button>

      {micError && (
        <p className="mic-error" role="alert">
          {micError}
        </p>
      )}
    </section>
  );
}

export default MicrophoneControl;