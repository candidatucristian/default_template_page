import React from "react";
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaExclamationTriangle,
} from "react-icons/fa";

const Toast = ({ toasts, onRemove }) => {
  const getIcon = (type) => {
    switch (type) {
      case "success":
        return <FaCheckCircle className="text-emerald-500" />;
      case "error":
        return <FaExclamationCircle className="text-red-500" />;
      case "warning":
        return <FaExclamationTriangle className="text-amber-500" />;
      default:
        return <FaCheckCircle className="text-emerald-500" />;
    }
  };

  const getBgColor = (type) => {
    switch (type) {
      case "success":
        return "bg-emerald-500/10 border-emerald-500/30";
      case "error":
        return "bg-red-500/10 border-red-500/30";
      case "warning":
        return "bg-amber-500/10 border-amber-500/30";
      default:
        return "bg-emerald-500/10 border-emerald-500/30";
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-sm 
            ${getBgColor(toast.type)} animate-slide-up cursor-pointer`}
          onClick={() => onRemove(toast.id)}
        >
          {getIcon(toast.type)}
          <span className="text-sm text-white">{toast.message}</span>
        </div>
      ))}
    </div>
  );
};

export default Toast;
