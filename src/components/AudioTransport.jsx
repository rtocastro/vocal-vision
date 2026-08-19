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
  onPlayPause,
  onSeek,
}) {
  const handleSeek = (event) => {
    onSeek(Number(event.target.value));
  };

  return (
    <section className="audio-transport">
      <button
        type="button"
        className="play-button"
        onClick={onPlayPause}
      >
        {isPlaying ? "Pause" : "Play"}
      </button>

      <div className="timeline">
        <span>{formatTime(currentTime)}</span>

        <input
          type="range"
          min="0"
          max={duration || 0}
          step="0.01"
          value={currentTime}
          onChange={handleSeek}
        />

        <span>{formatTime(duration)}</span>
      </div>
    </section>
  );
}

export default AudioTransport;