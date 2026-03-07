import { useState, useRef } from "react";

function Hero({ onExplore }) {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => setUploadedImage(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = () => {
    setAnalyzing(true);
    // TODO: wire up to backend/model
    setTimeout(() => setAnalyzing(false), 2000);
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <section className="hero">
      <h1>Welcome, one! 👋</h1>

      <p>Discover your culinary potential with our comprehensive recipe platform</p>

      <button className="hero-btn" onClick={onExplore}>
        Start Exploring Recipes
      </button>

      <div className="hero-upload-area">
        <p className="hero-upload-label">Or upload a food image to get recipe suggestions</p>

        <label className="hero-upload-btn" htmlFor="hero-image-input">
          📷 Choose Image
        </label>
        <input
          id="hero-image-input"
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          style={{ display: "none" }}
        />

        {uploadedImage && (
          <div className="hero-image-preview-wrapper">
            <img src={uploadedImage} alt="Uploaded preview" className="hero-image-preview" />
            <button className="hero-remove-btn" onClick={handleRemoveImage} title="Remove image">
              ✕
            </button>
          </div>
        )}

        {uploadedImage && (
          <button
            className="hero-analyze-btn"
            onClick={handleAnalyze}
            disabled={analyzing}
          >
            {analyzing ? "Analyzing..." : "🔍 Analyze Image"}
          </button>
        )}
      </div>
    </section>
  );
}

export default Hero;