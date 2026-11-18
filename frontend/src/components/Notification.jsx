import React, { useEffect, useState } from "react";
import "../styles/Notification.css";

/**
 * Notification Component
 * Reusable success / error / warning / info toast notification.
 *
 * Props:
 *   type        — "success" | "error" | "warning" | "info"
 *   message     — string message to display
 *   duration    — auto-dismiss after ms (default 4000ms, 0 = never)
 *   onClose     — callback when closed
 */
const Notification = ({ type = "success", message, duration = 4000, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!message) return;
    setVisible(true);
    if (duration > 0) {
      const timer = setTimeout(() => handleClose(), duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration]);

  const handleClose = () => {
    setVisible(false);
    if (onClose) onClose();
  };

  if (!message || !visible) return null;

  const icons = {
    success: "✅",
    error: "❌",
    warning: "⚠️",
    info: "ℹ️"
  };

  return (
    <div className={`notification notification--${type}`} role="status" aria-live="polite">
      <span className="notification__icon">{icons[type]}</span>
      <span className="notification__message">{message}</span>
      <button
        className="notification__close"
        onClick={handleClose}
        aria-label="Close notification"
      >
        ✕
      </button>
    </div>
  );
};

export default Notification;
