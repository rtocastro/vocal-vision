import { useCallback, useEffect, useRef, useState } from "react";

function useMicrophone() {
  const streamRef = useRef(null);

  const [isMicActive, setIsMicActive] = useState(false);
  const [micError, setMicError] = useState("");

  const startMicrophone = useCallback(async () => {
    if (streamRef.current) {
      return streamRef.current;
    }

    try {
      setMicError("");

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      streamRef.current = stream;
      setIsMicActive(true);

      return stream;
    } catch (error) {
      console.error("Unable to access microphone:", error);

      setMicError(
        error?.name === "NotAllowedError"
          ? "Microphone permission was denied."
          : "Unable to access the microphone."
      );

      setIsMicActive(false);

      return null;
    }
  }, []);

  const stopMicrophone = useCallback(() => {
    const stream = streamRef.current;

    if (!stream) return;

    stream.getTracks().forEach((track) => {
      track.stop();
    });

    streamRef.current = null;
    setIsMicActive(false);
  }, []);

  useEffect(() => {
    return () => {
      const stream = streamRef.current;

      if (!stream) return;

      stream.getTracks().forEach((track) => {
        track.stop();
      });
    };
  }, []);

  return {
    streamRef,
    isMicActive,
    micError,
    startMicrophone,
    stopMicrophone,
  };
}

export default useMicrophone;