import React, { useEffect } from "react";

const ICONS = {
  success: "✅",
  error: "⚠️",
  warning: "⚡",
  info: "ℹ️",
};

const Toast = ({ type = "info", message, onClose, duration = 4000 }) => {
  useEffect(() => {
    if (!message || !duration) return;
    const timer = setTimeout(() => onClose?.(), duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className={`toast toast--${type}`} role="status" aria-live="polite">
      <span className="toast__icon" aria-hidden="true">
        {ICONS[type] || ICONS.info}
      </span>
      <span className="toast__message">{message}</span>
      {onClose && (
        <button
          type="button"
          className="toast__close"
          aria-label="Cerrar notificación"
          onClick={onClose}
        >
          ×
        </button>
      )}
    </div>
  );
};

export default Toast;
