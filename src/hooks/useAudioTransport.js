import { useCallback, useEffect, useRef, useState } from "react";

function useAudioTransport(audioFile) {
  const audioRef = useRef(null);

  const [audioUrl, setAudioUrl] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!audioFile) {
      setAudioUrl("");
      return;
    }

    const objectUrl = URL.createObjectURL(audioFile);
    setAudioUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [audioFile]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioUrl]);

  const togglePlayback = useCallback(async () => {
    const audio = audioRef.current;

    if (!audio) return;

    if (audio.paused) {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (error) {
        console.error("Unable to play audio:", error);
      }
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  }, []);

  const seek = useCallback((time) => {
    const audio = audioRef.current;

    if (!audio) return;

    const safeTime = Math.min(Math.max(time, 0), audio.duration || 0);

    audio.currentTime = safeTime;
    setCurrentTime(safeTime);
  }, []);

  return {
    audioRef,
    audioUrl,
    isPlaying,
    currentTime,
    duration,
    togglePlayback,
    seek,
  };
}

export default useAudioTransport;