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
    const frequencyHistoryRef = useRef([]);

    const stopPitchDetection = useCallback(() => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
            frequencyHistoryRef.current = [];
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

            if (detectedFrequency) {
                const history = frequencyHistoryRef.current;

                history.push(detectedFrequency);

                // Keep only the most recent readings.
                if (history.length > 5) {
                    history.shift();
                }

                // Median filtering is useful here because one wild
                // pitch reading won't drag the entire result with it.
                const sorted = [...history].sort((a, b) => a - b);

                const middle = Math.floor(sorted.length / 2);

                const smoothedFrequency =
                    sorted.length % 2 === 0
                        ? (sorted[middle - 1] + sorted[middle]) / 2
                        : sorted[middle];

                setFrequency(smoothedFrequency);
            } else {
                frequencyHistoryRef.current = [];
                setFrequency(null);
            }

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