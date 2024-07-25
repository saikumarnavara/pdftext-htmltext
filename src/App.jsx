
import React, { useState } from "react";
import "./App.css";
import ExtractTextFromGif2 from "./components/ExtractTextFromGif2";

function App() {
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    setFile(URL.createObjectURL(event.target.files[0]));
  };

  return (
    <div>
      <h2>GIF Text Extraction v1</h2>
      <div style={{ width: "500px", height: "auto", margin: "20px" }}></div>
      <input type="file" accept="image/gif" onChange={handleFileChange} />
      <ExtractTextFromGif2 gifUrl={file} />
    </div>
  );
}

export default App;