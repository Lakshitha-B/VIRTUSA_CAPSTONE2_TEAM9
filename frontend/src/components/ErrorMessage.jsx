import React from "react";
import "../styles/ErrorMessage.css";

/**
 * ErrorMessage Component
 * Displays backend API errors, network errors, file errors, and server errors.
 *
 * Props:
 *   type    — "error" | "warning" | "network" | "server"
 *   message — string message to display
 *   onClose — optional callback to dismiss the error
 */
const ErrorMessage = ({ type = "error", message, onClose }) => {
  if (!message) return null;

  const icons = {
    error: "✖",
    warning: "⚠",
    network: "📡",
    server: "🔧"
  };

  const labels = {
    error: "Error",
    warning: "Warning",
    network: "Network Error",
    server: "Server Unavailable"
  };

  return (
    <div className={`error-message error-message--${type}`} role="alert">
      <span className="error-message__icon">{icons[type]}</span>
      <div className="error-message__body">
        <strong className="error-message__label">{labels[type]}</strong>
        <p className="error-message__text">{message}</p>
      </div>
      {onClose && (
        <button
          className="error-message__close"
          onClick={onClose}
          aria-label="Dismiss error"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
