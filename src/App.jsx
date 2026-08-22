import {
  useMemo,
  useState,
} from "react";
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
import ReferenceAnalyzer from "./components/ReferenceAnalyzer";
import useReferencePitchAnalysis from "./hooks/useReferencePitchAnalysis";
import TargetComparison from "./components/TargetComparison";
import { findReferencePitch } from "./utils/findReferencePitch";
import { comparePitches } from "./utils/comparePitches";
import { cleanReferencePitch } from "./utils/cleanReferencePitch";
import PitchLane from "./components/PitchLane";
import { getMelodyStats } from "./utils/getMelodyStats";
import { buildMelodySegments } from "./utils/buildMelodySegments";
import useLivePitchHistory from "./hooks/useLivePitchHistory";
import { smoothLivePitch } from "./utils/smoothLivePitch";
import "./App.css";

import VocalModeSelector from "./components/VocalModeSelector";

import {
  VOCAL_MODES,
  DEFAULT_VOCAL_MODE,
} from "./config/vocalModes";

function App() {
  const [audioFile, setAudioFile] = useState(null);
  const [referenceFile, setReferenceFile] =
    useState(null);

  const [vocalMode, setVocalMode] =
    useState(DEFAULT_VOCAL_MODE);

  const vocalModeConfig =
    VOCAL_MODES[vocalMode];



  const {
    referencePitchData,
    isAnalyzing,
    analysisError,
    analyzeReference,
  } = useReferencePitchAnalysis();

  const {
    audioRef,
    audioUrl,
    isPlaying,
    currentTime,
    visualTime,
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

  const {
    pitchHistory,
    clearPitchHistory,
  } = useLivePitchHistory({
    frequency,
    currentTime: visualTime,
    isMicActive,
    isPlaying,
  });

  const smoothedFrequency =
    useMemo(() => {
      const recentFrequencies =
        pitchHistory.map(
          (point) => point.frequency
        );

      return smoothLivePitch(
        recentFrequencies,
        vocalModeConfig.smoothingSamples
      );
    }, [
      pitchHistory,
      vocalModeConfig.smoothingSamples,
    ]);


  const pitchInfo = smoothedFrequency
    ? frequencyToNote(smoothedFrequency)
    : null;

  const cents =
    smoothedFrequency && pitchInfo
      ? centsFromPitch(
        smoothedFrequency,
        pitchInfo.midiNumber
      )
      : null;

  // Clean the raw reference vocal data FIRST.
  const cleanedReferencePitchData =
    useMemo(() => {
      return cleanReferencePitch(
        referencePitchData
      );
    }, [referencePitchData]);

  // Generate stats from the cleaned data.
  const melodyStats = useMemo(() => {
    return getMelodyStats(
      cleanedReferencePitchData
    );
  }, [cleanedReferencePitchData]);

  // NOW we can use cleanedReferencePitchData.
  const targetPitchPoint =
    findReferencePitch(
      cleanedReferencePitchData,
      currentTime
    );

  const targetPitchInfo =
    targetPitchPoint?.frequency
      ? frequencyToNote(
        targetPitchPoint.frequency
      )
      : null;

const pitchComparison =
  targetPitchPoint?.frequency &&
  smoothedFrequency
    ? comparePitches(
        smoothedFrequency,
        targetPitchPoint.frequency,
        vocalModeConfig.toleranceCents
      )
    : null;

    
  const melodySegments = useMemo(() => {
    return buildMelodySegments(
      cleanedReferencePitchData
    );
  }, [cleanedReferencePitchData]);

  const handleSeek = (time) => {
    clearPitchHistory();
    seek(time);
  };

  const handleRestart = () => {
    clearPitchHistory();
    restart();
  };

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
              onSeek={handleSeek}
              onRestart={handleRestart}
              onVolumeChange={changeVolume}
            />

            <VocalModeSelector
              activeMode={vocalMode}
              onModeChange={setVocalMode}
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
            <ReferenceAnalyzer
              referenceFile={referenceFile}
              isAnalyzing={isAnalyzing}
              analysisError={analysisError}
              pitchData={referencePitchData}
              melodyStats={melodyStats}
              onFileSelect={setReferenceFile}
              onAnalyze={analyzeReference}
            />
            <TargetComparison
              targetNote={targetPitchInfo?.label}
              targetFrequency={
                targetPitchPoint?.frequency ?? null
              }
              liveNote={pitchInfo?.label}
              liveFrequency={smoothedFrequency}
              comparison={pitchComparison}
              isPlaying={isPlaying}
              isMicActive={isMicActive}
              
            />
            <PitchLane
              segments={melodySegments}
              currentTime={visualTime}
              liveFrequency={smoothedFrequency}
              livePitchHistory={pitchHistory}
              isPlaying={isPlaying}
              
            />
          </>
        )}
      </section>
    </main>
  );
}

export default App;