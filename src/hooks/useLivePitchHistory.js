import {
  useEffect,
  useRef,
  useState,
} from "react";

function useLivePitchHistory({
  frequency,
  currentTime,
  isMicActive,
  isPlaying,
  historySeconds = 2,
}) {
  const [pitchHistory, setPitchHistory] =
    useState([]);

  const lastRecordedTimeRef =
    useRef(null);

  useEffect(() => {
    if (
      !isMicActive ||
      !isPlaying ||
      !Number.isFinite(frequency) ||
      !Number.isFinite(currentTime)
    ) {
      return;
    }

    // Don't store multiple readings for essentially
    // the exact same song timestamp.
    const lastRecordedTime =
      lastRecordedTimeRef.current;

    if (
      Number.isFinite(lastRecordedTime) &&
      Math.abs(
        currentTime - lastRecordedTime
      ) < 0.025
    ) {
      return;
    }

    lastRecordedTimeRef.current =
      currentTime;

    const cutoff =
      currentTime - historySeconds;

    setPitchHistory((previous) => {
      const recentPoints =
        previous.filter(
          (point) =>
            point.time >= cutoff &&
            point.time <= currentTime
        );

      return [
        ...recentPoints,
        {
          time: currentTime,
          frequency,
        },
      ];
    });
  }, [
    frequency,
    currentTime,
    isMicActive,
    isPlaying,
    historySeconds,
  ]);

  // Clear history when microphone turns off.
  useEffect(() => {
    if (!isMicActive) {
      setPitchHistory([]);
      lastRecordedTimeRef.current = null;
    }
  }, [isMicActive]);

  const clearPitchHistory = () => {
    setPitchHistory([]);
    lastRecordedTimeRef.current = null;
  };

  return {
    pitchHistory,
    clearPitchHistory,
  };
}

export default useLivePitchHistory;