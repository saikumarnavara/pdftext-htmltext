import React, { useState, useEffect } from "react";
import Tesseract from "tesseract.js";
import Typo from "typo-js";

const ExtractTextFromGif2 = ({ gifUrl }) => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");

  const preprocessImage = (url, callback) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = url;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, img.width, img.height);

      // Convert to grayscale
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = avg;
        data[i + 1] = avg;
        data[i + 2] = avg;
      }
      ctx.putImageData(imageData, 0, 0);

      callback(canvas.toDataURL("image/png"));
    };
    img.onerror = (error) => {
      console.error("Error loading image:", error);
      setLoading(false);
    };
  };

  const correctTextChunk = (textChunk, dictionary) => {
    return textChunk
      .split(" ")
      .map((word) =>
        dictionary.check(word) ? word : dictionary.suggest(word)[0] || word
      )
      .join(" ");
  };

  const extractText = () => {
    setLoading(true);
    preprocessImage(gifUrl, (processedImageUrl) => {
      Tesseract.recognize(processedImageUrl, "eng", {
        logger: (m) => console.log(m),
      })
        .then(({ data: { text } }) => {
          console.log("Raw extracted text:", text);
          const dictionary = new Typo("en_US");
          const textChunks = text.match(/[\s\S]{1,2000}/g) || []; // Split text into chunks of up to 2000 characters
          const correctedChunks = textChunks.map(chunk => correctTextChunk(chunk, dictionary));
          const correctedText = correctedChunks.join(" ");
          console.log("Corrected text:", correctedText);
          setText(correctedText);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error extracting text:", err);
          setLoading(false);
        });
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
      {showImage && (
        <img
          src={gifUrl}
          alt="GIF"
          style={{ width: "500px", height: "auto", padding: "20px" }}
        />
      )}
      <br />
      {gifUrl && (
        <div>
          <button onClick={extractText}>Extract Text</button>
          <button
            onClick={() => {
              setShowImage(!showImage);
            }}
          >
            {showImage ? "Hide Image" : "Show Image"}
          </button>
        </div>
      )}
      {loading && <p>Loading...</p>}
      {text && (
        <div>
          <br />
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
        <a href={downloadUrl} download="extracted-html.html">
          <button>Download HTML</button>
        </a>
      )}
    </div>
  );
};

export default ExtractTextFromGif2;

