
import "../styles/DocumentPreview.css";

const API_URL = "http://localhost:5000/api/files";

function DocumentPreview({ filename, onClose }) {
    const fileUrl = `${API_URL}/${encodeURIComponent(filename)}`;

    const isPDF = filename.toLowerCase().endsWith(".pdf");

    const isImage = /\.(png|jpg|jpeg|gif|webp)$/i.test(filename);

    return (
        <div className="preview-overlay">
            <div className="preview-container">

                <div className="preview-header">
                    <h2>{filename}</h2>

                    <button
                        className="close-preview"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>

                <div className="preview-content">
                    {isPDF ? (
                        <iframe
                            src={fileUrl}
                            title="PDF Preview"
                            className="pdf-preview"
                        />
                    ) : isImage ? (
                        <img
                            src={fileUrl}
                            alt={filename}
                            className="image-preview"
                        />
                    ) : (
                        <p>
                            Preview is not available for this file type.
                        </p>
                    )}
                </div>

            </div>
        </div>
    );
}

export default DocumentPreview;
