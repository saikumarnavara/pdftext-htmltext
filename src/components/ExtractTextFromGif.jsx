import React, { useState, useEffect } from "react";
import Tesseract from "tesseract.js";

const ExtractTextFromGif = ({ gifUrl }) => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");

  const extractText = () => {
    setLoading(true);
    Tesseract.recognize(gifUrl, "eng", {
      logger: (m) => console.log(m), // Add logger here to track progress
    })
      .then(({ data: { text } }) => {
        setText(text);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error extracting text:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (text) {
      const htmlContent = text
        .split("\n")
        .map((line) => `${line}<br />`)
        .join("");
      const blob = new Blob([htmlContent], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    }
  }, [text]);

  return (
    <div>
      <img src={gifUrl} alt="GIF" style={{ width: "500px", height: "auto" }} />
      <button onClick={extractText}>Extract Text</button>
      {loading && <p>Loading...</p>}
      {text && (
        <div>
          <h3>Extracted Text:</h3>
          <div
            dangerouslySetInnerHTML={{
              __html: text
                .split("\n")
                .map((line) => `${line}<br />`)
                .join(""),
            }}
          />
        </div>
      )}
      {downloadUrl && (
        <a href={downloadUrl} download="extracted-text.html">
          <button>Download HTML</button>
        </a>
      )}
    </div>
  );
};

export default ExtractTextFromGif;
