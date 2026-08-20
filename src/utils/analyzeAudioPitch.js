import { detectPitch } from "./detectPitch";

export function analyzeAudioPitch(
  audioBuffer,
  {
    windowSize = 2048,
    hopSize = 1024,
  } = {}
) {
  const sampleRate = audioBuffer.sampleRate;
  const channelCount = audioBuffer.numberOfChannels;
  const length = audioBuffer.length;

  const monoBuffer = new Float32Array(length);

  // Mix all channels down to mono.
  for (let channel = 0; channel < channelCount; channel += 1) {
    const channelData = audioBuffer.getChannelData(channel);

    for (let i = 0; i < length; i += 1) {
      monoBuffer[i] += channelData[i] / channelCount;
    }
  }

  const pitchPoints = [];

  for (
    let start = 0;
    start + windowSize <= monoBuffer.length;
    start += hopSize
  ) {
    const frame = monoBuffer.slice(
      start,
      start + windowSize
    );

    const frequency = detectPitch(
      frame,
      sampleRate
    );

    const time = start / sampleRate;

    pitchPoints.push({
      time,
      frequency,
    });
  }

  return pitchPoints;
}