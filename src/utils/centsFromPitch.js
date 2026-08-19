export function centsFromPitch(
  frequency,
  midiNumber
) {
  if (
    !frequency ||
    frequency <= 0 ||
    midiNumber == null
  ) {
    return null;
  }

  const targetFrequency =
    440 * Math.pow(
      2,
      (midiNumber - 69) / 12
    );

  const cents =
    1200 *
    Math.log2(
      frequency / targetFrequency
    );

  return cents;
}