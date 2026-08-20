function ReferenceAnalyzer({
  referenceFile,
  isAnalyzing,
  analysisError,
  pitchData,
  onFileSelect,
  onAnalyze,
}) {
  const handleFileChange = (event) => {
    const file =
      event.target.files?.[0];

    if (!file) return;

    onFileSelect(file);
  };

  const detectedPoints =
    pitchData.filter(
      (point) => point.frequency
    ).length;

  return (
    <section className="reference-analyzer">
      <div className="reference-header">
        <div>
          <p className="section-label">
            REFERENCE VOCAL
          </p>

          <h2>Target Melody</h2>
        </div>

        {pitchData.length > 0 && (
          <span className="analysis-status">
            ANALYZED
          </span>
        )}
      </div>

      <label
        htmlFor="reference-upload"
        className="upload-label"
      >
        Choose Reference Vocal
      </label>

      <input
        id="reference-upload"
        type="file"
        accept="audio/*"
        onChange={handleFileChange}
        hidden
      />

      {referenceFile && (
        <p className="file-name">
          Loaded:{" "}
          <strong>
            {referenceFile.name}
          </strong>
        </p>
      )}

      {referenceFile && (
        <button
          type="button"
          className="analyze-button"
          disabled={isAnalyzing}
          onClick={() =>
            onAnalyze(referenceFile)
          }
        >
          {isAnalyzing
            ? "Analyzing..."
            : "Analyze Vocal"}
        </button>
      )}

      {analysisError && (
        <p
          className="mic-error"
          role="alert"
        >
          {analysisError}
        </p>
      )}

      {pitchData.length > 0 && (
        <div className="analysis-results">
          <div>
            <span>Total Samples</span>
            <strong>
              {pitchData.length}
            </strong>
          </div>

          <div>
            <span>Pitch Detected</span>
            <strong>
              {detectedPoints}
            </strong>
          </div>
        </div>
      )}
    </section>
  );
}

export default ReferenceAnalyzer;