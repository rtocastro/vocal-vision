import { useCallback, useState } from "react";
import { analyzeAudioPitch } from "../utils/analyzeAudioPitch";

function useReferencePitchAnalysis() {
  const [referencePitchData, setReferencePitchData] =
    useState([]);

  const [isAnalyzing, setIsAnalyzing] =
    useState(false);

  const [analysisError, setAnalysisError] =
    useState("");

  const analyzeReference = useCallback(
    async (audioFile) => {
      if (!audioFile) {
        return;
      }

      setIsAnalyzing(true);
      setAnalysisError("");
      setReferencePitchData([]);

      let audioContext = null;

      try {
        const AudioContextClass =
          window.AudioContext ||
          window.webkitAudioContext;

        if (!AudioContextClass) {
          throw new Error(
            "Web Audio API is not supported."
          );
        }

        audioContext =
          new AudioContextClass();

        const arrayBuffer =
          await audioFile.arrayBuffer();

        const decodedAudio =
          await audioContext.decodeAudioData(
            arrayBuffer
          );

        const pitchData =
          analyzeAudioPitch(decodedAudio);

        setReferencePitchData(pitchData);

        return pitchData;
      } catch (error) {
        console.error(
          "Unable to analyze reference audio:",
          error
        );

        setAnalysisError(
          "Unable to analyze this reference audio file."
        );

        return [];
      } finally {
        setIsAnalyzing(false);

        if (audioContext) {
          await audioContext.close();
        }
      }
    },
    []
  );

  const clearReferenceAnalysis =
    useCallback(() => {
      setReferencePitchData([]);
      setAnalysisError("");
    }, []);

  return {
    referencePitchData,
    isAnalyzing,
    analysisError,
    analyzeReference,
    clearReferenceAnalysis,
  };
}

export default useReferencePitchAnalysis;