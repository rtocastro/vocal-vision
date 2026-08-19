import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { detectPitch } from "../utils/detectPitch";

function usePitchDetection(streamRef, isMicActive) {
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const animationFrameRef = useRef(null);

  const [frequency, setFrequency] = useState(null);

  const stopPitchDetection = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }

    if (analyserRef.current) {
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setFrequency(null);
  }, []);

  const startPitchDetection = useCallback(async () => {
    const stream = streamRef.current;

    if (!stream) return;

    // Prevent multiple detection loops.
    if (audioContextRef.current) return;

    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) {
      console.error("Web Audio API is not supported.");
      return;
    }

    const audioContext = new AudioContextClass();

    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }

    const analyser = audioContext.createAnalyser();

    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0;

    const source =
      audioContext.createMediaStreamSource(stream);

    source.connect(analyser);

    audioContextRef.current = audioContext;
    analyserRef.current = analyser;
    sourceRef.current = source;

    const buffer = new Float32Array(
      analyser.fftSize
    );

    const analyze = () => {
      if (!analyserRef.current) return;

      analyserRef.current.getFloatTimeDomainData(
        buffer
      );

      const detectedFrequency = detectPitch(
        buffer,
        audioContext.sampleRate
      );

      setFrequency(detectedFrequency);

      animationFrameRef.current =
        requestAnimationFrame(analyze);
    };

    analyze();
  }, [streamRef]);

  useEffect(() => {
    if (isMicActive) {
      startPitchDetection();
    } else {
      stopPitchDetection();
    }

    return () => {
      stopPitchDetection();
    };
  }, [
    isMicActive,
    startPitchDetection,
    stopPitchDetection,
  ]);

  return {
    frequency,
  };
}

export default usePitchDetection;