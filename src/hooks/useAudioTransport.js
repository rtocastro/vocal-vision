import { useCallback, useEffect, useRef, useState } from "react";

function useAudioTransport(audioFile) {
  const audioRef = useRef(null);

  const [audioUrl, setAudioUrl] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);

  // Create a temporary browser URL whenever a new file is selected.
  useEffect(() => {
    if (!audioFile) {
      setAudioUrl("");
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      return;
    }

    const objectUrl = URL.createObjectURL(audioFile);

    setAudioUrl(objectUrl);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [audioFile]);

  // Connect browser audio events to React state.
  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(
        Number.isFinite(audio.duration) ? audio.duration : 0
      );

      audio.volume = volume;
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(audio.duration || 0);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener(
        "loadedmetadata",
        handleLoadedMetadata
      );
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioUrl, volume]);

  const togglePlayback = useCallback(async () => {
    const audio = audioRef.current;

    if (!audio) return;

    // If playback already reached the end, start over.
    if (
      audio.duration &&
      audio.currentTime >= audio.duration
    ) {
      audio.currentTime = 0;
      setCurrentTime(0);
    }

    if (audio.paused) {
      try {
        await audio.play();
      } catch (error) {
        console.error("Unable to play audio:", error);
      }
    } else {
      audio.pause();
    }
  }, []);

  const seek = useCallback((time) => {
    const audio = audioRef.current;

    if (!audio) return;

    const duration = Number.isFinite(audio.duration)
      ? audio.duration
      : 0;

    const safeTime = Math.min(
      Math.max(time, 0),
      duration
    );

    audio.currentTime = safeTime;
    setCurrentTime(safeTime);
  }, []);

  const restart = useCallback(() => {
    const audio = audioRef.current;

    if (!audio) return;

    audio.currentTime = 0;
    setCurrentTime(0);
  }, []);

  const changeVolume = useCallback((newVolume) => {
    const safeVolume = Math.min(
      Math.max(newVolume, 0),
      1
    );

    setVolume(safeVolume);

    if (audioRef.current) {
      audioRef.current.volume = safeVolume;
    }
  }, []);

  return {
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
  };
}

export default useAudioTransport;