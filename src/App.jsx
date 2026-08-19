import { useState } from "react";
import AudioUploader from "./components/AudioUploader";
import AudioTransport from "./components/AudioTransport";
import useAudioTransport from "./hooks/useAudioTransport";
import "./App.css";

function App() {
  const [audioFile, setAudioFile] = useState(null);

  const {
    audioRef,
    audioUrl,
    isPlaying,
    currentTime,
    duration,
    volume,
    togglePlayback,
    seek,
    restart,
    changeVolume,
  } = useAudioTransport(audioFile);

  return (
    <main className="app">
      <header className="app-header">
        <p className="eyebrow">VOCAL VISION</p>
        <h1>See your voice.</h1>
        <p className="subtitle">
          Upload a track and prepare it for vocal pitch practice.
        </p>
      </header>

      <section className="workspace">
        <AudioUploader
          audioFile={audioFile}
          onFileSelect={setAudioFile}
        />

        {audioUrl && (
          <>
            <audio ref={audioRef} src={audioUrl} preload="metadata" />

<AudioTransport
  isPlaying={isPlaying}
  currentTime={currentTime}
  duration={duration}
  volume={volume}
  onPlayPause={togglePlayback}
  onSeek={seek}
  onRestart={restart}
  onVolumeChange={changeVolume}
/>
          </>
        )}
      </section>
    </main>
  );
}

export default App;