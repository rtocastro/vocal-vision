import { useState } from "react";
import AudioUploader from "./components/AudioUploader";
import AudioTransport from "./components/AudioTransport";
import useAudioTransport from "./hooks/useAudioTransport";
import MicrophoneControl from "./components/MicrophoneControl";
import useMicrophone from "./hooks/useMicrophone";
import PitchReadout from "./components/PitchReadout";
import usePitchDetection from "./hooks/usePitchDetection";
import { frequencyToNote } from "./utils/frequencyToNote";
import { centsFromPitch } from "./utils/centsFromPitch";
import PitchMeter from "./components/PitchMeter";
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

  const {
    streamRef,
    isMicActive,
    micError,
    startMicrophone,
    stopMicrophone,
  } = useMicrophone();

  const {
    frequency,
  } = usePitchDetection(
    streamRef,
    isMicActive
  );

  const pitchInfo = frequency
    ? frequencyToNote(frequency)
    : null;

  const cents =
    frequency && pitchInfo
      ? centsFromPitch(
        frequency,
        pitchInfo.midiNumber
      )
      : null;

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
            <MicrophoneControl
              isMicActive={isMicActive}
              micError={micError}
              onStart={startMicrophone}
              onStop={stopMicrophone}
            />
            <PitchReadout
              frequency={frequency}
              note={pitchInfo?.label}
              cents={cents}
              isMicActive={isMicActive}
            />
            <PitchMeter
              note={pitchInfo?.label}
              cents={cents}
              isMicActive={isMicActive}
            />
          </>
        )}
      </section>
    </main>
  );
}

export default App;