
import React, { useState, useRef } from "react";
import "../styles/fileUpload.css";

const ALLOWED_TYPES = {
  ".pdf": "application/pdf",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_FILES = 5;

function validateFile(file) {
  const extension = file.name
    .slice(file.name.lastIndexOf("."))
    .toLowerCase();

  const expectedMime = ALLOWED_TYPES[extension];

  if (!expectedMime) {
    return `${file.name}: Unsupported file format.`;
  }

  if (file.type !== expectedMime) {
    return `${file.name}: File type and extension do not match.`;
  }

  if (file.size === 0) {
    return `${file.name}: Empty files are not allowed.`;
  }

  if (file.size > MAX_FILE_SIZE) {
    return `${file.name}: File exceeds 5 MB.`;
  }

  return null;
}

function FileUpload({ onUploadSuccess }) {
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Open file explorer
  const handleBrowse = () => {
    fileInputRef.current.click();
  };

  // Common validation for Browse and Drag & Drop
  const handleSelectedFiles = (selectedFiles) => {
    const validFiles = [];
    const errors = [];

    selectedFiles.forEach((file) => {
      const error = validateFile(file);

      if (error) {
        errors.push(error);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      alert(errors.join("\n"));
    }

    if (validFiles.length > 0) {
      setFiles((previousFiles) => {
        if (previousFiles.length + validFiles.length > MAX_FILES) {
          alert(`You can upload a maximum of ${MAX_FILES} files.`);
          return previousFiles;
        }

        return [...previousFiles, ...validFiles];
      });
    }
  };

  // Handle selected files from Browse
  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);

    handleSelectedFiles(selectedFiles);

    event.target.value = "";
  };

  // Remove selected file
  const handleRemove = (index) => {
    setFiles((previousFiles) =>
      previousFiles.filter((_, i) => i !== index)
    );
  };

  // Upload files to backend
  const handleUpload = async () => {
    if (files.length === 0) {
      alert("Please select files first!");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();

      files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch(
        "http://localhost:5000/api/documents/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error?.message || "File upload failed."
        );
      }

      alert(data.message);

      console.log("Validated files:", data.files);

      setFiles([]);

      // Navigate to Uploaded Documents after successful upload
      onUploadSuccess?.();

    } catch (error) {
      console.error("Upload error:", error);
      alert(error.message || "Unable to connect to the server.");
    } finally {
      setIsUploading(false);
    }
  };

  // Handle drag and drop
  const handleDrop = (event) => {
    event.preventDefault();

    const droppedFiles = Array.from(event.dataTransfer.files);

    handleSelectedFiles(droppedFiles);
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
          <div className="upload-icon">📤</div>

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
            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
            multiple
            hidden
          />

          <p className="file-info">
            PDF, JPG, JPEG and PNG | Maximum 5 MB per file | Maximum 5 files
          </p>
        </div>

        {/* Display Selected Files */}
        {files.length > 0 && (
          <div className="file-list">

            <h3>Selected Files ({files.length}/{MAX_FILES})</h3>

            {files.map((file, index) => (
              <div className="file-item" key={index}>

                <span>📄 {file.name}</span>

                <button
                  className="remove-button"
                  onClick={() => handleRemove(index)}
                  type="button"
                  title="Delete file"
                  aria-label={`Delete ${file.name}`}
                  disabled={isUploading}
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
          disabled={files.length === 0 || isUploading}
          type="button"
        >
          {isUploading ? "Uploading..." : "Upload Files"}
        </button>

      </div>
    </div>
  );
}

export default FileUpload;
