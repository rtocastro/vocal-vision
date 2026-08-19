function AudioUploader({ onFileSelect, audioFile }) {
  const handleChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    onFileSelect(file);
  };

  return (
    <section className="audio-uploader">
      <label htmlFor="audio-upload" className="upload-label">
        Choose Audio File
      </label>

      <input
        id="audio-upload"
        type="file"
        accept="audio/*"
        onChange={handleChange}
      />

      {audioFile && (
        <p className="file-name">
          Loaded: <strong>{audioFile.name}</strong>
        </p>
      )}
    </section>
  );
}

export default AudioUploader;