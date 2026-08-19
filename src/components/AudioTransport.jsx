function formatTime(seconds) {
  if (!Number.isFinite(seconds)) {
    return "0:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${minutes}:${remainingSeconds
    .toString()
    .padStart(2, "0")}`;
}

function AudioTransport({
  isPlaying,
  currentTime,
  duration,
  volume,
  onPlayPause,
  onSeek,
  onRestart,
  onVolumeChange,
}) {
  const handleSeek = (event) => {
    onSeek(Number(event.target.value));
  };

  const handleVolume = (event) => {
    onVolumeChange(Number(event.target.value));
  };

  return (
    <section className="audio-transport">
      <div className="transport-buttons">
        <button
          type="button"
          className="restart-button"
          onClick={onRestart}
          aria-label="Restart track"
        >
          ↺
        </button>

        <button
          type="button"
          className="play-button"
          onClick={onPlayPause}
        >
          {isPlaying ? "Pause" : "Play"}
        </button>
      </div>

      <div className="transport-content">
        <div className="timeline">
          <span>{formatTime(currentTime)}</span>

          <input
            type="range"
            min="0"
            max={duration || 0}
            step="0.01"
            value={currentTime}
            onChange={handleSeek}
            aria-label="Track position"
          />

          <span>{formatTime(duration)}</span>
        </div>

        <div className="volume-control">
          <label htmlFor="volume">Volume</label>

          <input
            id="volume"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolume}
          />

          <span>{Math.round(volume * 100)}%</span>
        </div>
      </div>
    </section>
  );
}

export default AudioTransport;