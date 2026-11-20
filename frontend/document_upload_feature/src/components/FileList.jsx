
import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/FileList.css";
import DocumentPreview from "./DocumentPreview";

const API_URL = "http://localhost:5000/api/files";

function FileList() {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);

    // Fetch uploaded documents
    const fetchFiles = async () => {
        try {
            setLoading(true);

            const response = await axios.get(API_URL);

            // Sort newest uploaded files first
            const sortedFiles = [...response.data.files].sort(
                (a, b) =>
                    new Date(b.uploadDate).getTime() -
                    new Date(a.uploadDate).getTime()
            );

            setFiles(sortedFiles);
            setError("");

        } catch (err) {
            console.error("Error fetching files:", err);
            setError("Unable to load documents. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFiles();
    }, []);

    // Format file size
    const formatFileSize = (bytes) => {
        if (bytes < 1024) return `${bytes} Bytes`;

        if (bytes < 1024 * 1024) {
            return `${(bytes / 1024).toFixed(2)} KB`;
        }

        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    // Preview document using stored filename
    const handlePreview = (filename) => {
        setSelectedFile(filename);
    };

    // Download document using stored filename
    const handleDownload = (filename) => {
        window.open(
            `${API_URL}/${encodeURIComponent(filename)}/download`,
            "_blank"
        );
    };

    // Delete document using stored filename
    const handleDelete = async (filename, originalname) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete ${originalname || filename}?`
        );

        if (!confirmed) return;

        try {
            await axios.delete(
                `${API_URL}/${encodeURIComponent(filename)}`
            );

            alert("Document deleted successfully.");

            if (selectedFile === filename) {
                setSelectedFile(null);
            }

            await fetchFiles();

        } catch (err) {
            console.error("Delete error:", err);
            alert("Unable to delete document.");
        }
    };

    return (
        <div className="documents-page">
            <div className="documents-container">

                <h1>Secure Document Upload System</h1>

                <p className="documents-subtitle">
                    Manage, preview, download and delete your documents.
                </p>

                <div className="documents-content">

                    <h2>Uploaded Documents</h2>

                    {loading ? (
                        <p className="documents-message">
                            Loading documents...
                        </p>
                    ) : error ? (
                        <p className="documents-error">
                            {error}
                        </p>
                    ) : files.length === 0 ? (
                        <p className="documents-empty">
                            No documents uploaded yet.
                        </p>
                    ) : (
                        <div className="documents-list">

                            {files.map((file) => (
                                <div
                                    className="document-card"
                                    key={file.filename}
                                >

                                    <div className="document-details">

                                        {/* Display original filename */}
                                        <h3>
                                            {file.originalname || file.filename}
                                        </h3>

                                        <p>
                                            Size: {formatFileSize(file.size)}
                                        </p>

                                        <p>
                                            Uploaded:{" "}
                                            {new Date(
                                                file.uploadDate
                                            ).toLocaleString()}
                                        </p>

                                    </div>

                                    <div className="document-actions">

                                        <button
                                            className="preview-button"
                                            onClick={() =>
                                                handlePreview(file.filename)
                                            }
                                        >
                                            Preview
                                        </button>

                                        <button
                                            className="download-button"
                                            onClick={() =>
                                                handleDownload(file.filename)
                                            }
                                        >
                                            Download
                                        </button>

                                        <button
                                            className="delete-button"
                                            onClick={() =>
                                                handleDelete(
                                                    file.filename,
                                                    file.originalname
                                                )
                                            }
                                        >
                                            Delete
                                        </button>

                                    </div>

                                </div>
                            ))}

                        </div>
                    )}

                </div>

                {/* Document Preview Window */}
                {selectedFile && (
                    <DocumentPreview
                        filename={selectedFile}
                        onClose={() => setSelectedFile(null)}
                    />
                )}

            </div>
        </div>
    );
}

export default FileList;
