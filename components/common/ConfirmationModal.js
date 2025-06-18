"use client";

import { AlertTriangle, Trash2 } from "lucide-react";

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger", // 'danger', 'warning', 'info'
  isLoading = false,
}) {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          icon: <Trash2 className="w-6 h-6 text-red-400" />,
          confirmButton: "bg-red-600 hover:bg-red-700 text-white",
          titleColor: "text-red-400",
          borderColor: "border-zinc-800/50",
        };
      case "warning":
        return {
          icon: <AlertTriangle className="w-6 h-6 text-yellow-400" />,
          confirmButton: "bg-yellow-600 hover:bg-yellow-700 text-white",
          titleColor: "text-yellow-400",
          borderColor: "border-zinc-800/50",
        };
      default:
        return {
          icon: <AlertTriangle className="w-6 h-6 text-blue-400" />,
          confirmButton: "bg-blue-600 hover:bg-blue-700 text-white",
          titleColor: "text-blue-400",
          borderColor: "border-zinc-800/50",
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-[60] p-4">
      <div
        className={`bg-zinc-950 border ${styles.borderColor} rounded-lg max-w-md w-full shadow-2xl`}
      >
        {/* Header */}
        <div className="flex items-center gap-3 p-6 border-b border-zinc-800">
          {styles.icon}
          <h3 className={`text-lg font-semibold ${styles.titleColor}`}>
            {title}
          </h3>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-zinc-300 text-sm leading-relaxed">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-zinc-800">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${styles.confirmButton}`}
          >
            {isLoading && (
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
            )}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
