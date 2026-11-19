
import React, { useState, useRef } from "react";
import "../styles/fileUpload.css";

function FileUpload() {

  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);

  // Open file explorer
  const handleBrowse = () => {
    fileInputRef.current.click();
  };

  // Handle selected files
  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);

    setFiles((previousFiles) => [
      ...previousFiles,
      ...selectedFiles
    ]);

    event.target.value = "";
  };

  // Remove selected file
  const handleRemove = (index) => {
    setFiles((previousFiles) =>
      previousFiles.filter((_, i) => i !== index)
    );
  };
  // Handle file upload
const handleUpload = () => {

  if (files.length === 0) {
    alert("Please select files first!");
    return;
  }

  console.log("Files ready for upload:", files);

  alert("Files are ready for upload!");

};

  // Handle drag and drop
  const handleDrop = (event) => {
    event.preventDefault();

    const droppedFiles = Array.from(event.dataTransfer.files);

    setFiles((previousFiles) => [
      ...previousFiles,
      ...droppedFiles
    ]);
  };

  // Handle drag over
  const handleDragOver = (event) => {
    event.preventDefault();
  };

  return (
    <div className="upload-page">

      <div className="upload-container">

        <h1>File Upload</h1>

        <p>Select your files to upload</p>

        {/* Drag and Drop Area */}
        <div
          className="drop-area"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >

          <div className="upload-icon">☁️</div>

          <h3>Drag & Drop Your Files Here</h3>

          <p>or</p>

          <button
            className="browse-button"
            onClick={handleBrowse}
            type="button"
          >
            Browse Files
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            hidden
          />

          <p className="file-info">
            Select files from your computer
          </p>

        </div>

        {/* Display Selected Files */}
        {files.length > 0 && (
          <div className="file-list">

            <h3>Selected Files</h3>

            {files.map((file, index) => (
              <div className="file-item" key={index}>

                <span>📄 {file.name}</span>

               <button
  className="remove-button"
  onClick={() => handleRemove(index)}
  type="button"
  title="Delete file"
  aria-label={`Delete ${file.name}`}
>
  🗑️
</button>

              </div>
            ))}

          </div>
        )}
        {/* Upload Button */}
<button
  className="upload-button"
  onClick={handleUpload}
  disabled={files.length === 0}
  type="button"
>
  Upload Files
</button>

      </div>

    </div>
  );
}

export default FileUpload;
