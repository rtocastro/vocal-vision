import { VOCAL_MODES } from "../config/vocalModes";

function VocalModeSelector({
  activeMode,
  onModeChange,
}) {
  const activeConfig =
    VOCAL_MODES[activeMode];

  return (
    <section className="vocal-mode">
      <div className="vocal-mode-header">
        <div>
          <p className="section-label">
            DETECTION PROFILE
          </p>

          <h2>Vocal Mode</h2>
        </div>

        <span className="vocal-mode-tolerance">
          ±{activeConfig.toleranceCents}¢
        </span>
      </div>

      <div className="vocal-mode-options">
        {Object.values(VOCAL_MODES).map(
          (mode) => (
            <button
              key={mode.id}
              type="button"
              className={`vocal-mode-button ${
                activeMode === mode.id
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                onModeChange(mode.id)
              }
            >
              <strong>{mode.label}</strong>

              <span>
                {mode.description}
              </span>
            </button>
          )
        )}
      </div>

      <p className="vocal-mode-current">
        Current tolerance:{" "}
        <strong>
          ±{activeConfig.toleranceCents} cents
        </strong>
      </p>
    </section>
  );
}

export default VocalModeSelector;