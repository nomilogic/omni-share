import React from "react";
import { AlertCircle, CheckCircle, X } from "lucide-react";
import Icon from "./Icon";
import logoText from "../assets/logo-text.svg";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDangerous?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  isDangerous = false,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop with blur effect */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn"
        onClick={onCancel}
      />

      {/* Confirm dialog container */}
      <div className="relative z-10 bg-white/95 backdrop-blur-md border border-purple-200 rounded-lg md:p-8 p-6 max-w-md w-full mx-4 shadow-lg animate-slideUp">
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo and branding */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            {isDangerous ? (
              <AlertCircle className="w-12 h-12 text-red-500" />
            ) : (
              <AlertCircle className="w-12 h-12 text-purple-500" />
            )}
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
        </div>

        {/* Message */}
        <div className="text-center mb-8">
          <p className="text-gray-600 text-sm leading-relaxed">{message}</p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 border border-[#7650e3] text-[#7650e3] bg-white font-semibold rounded-md transition-all duration-200 hover:bg-[#d7d7fc] hover:text-[#7650e3] hover:border-[#7650e3]"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 font-semibold rounded-md transition-all duration-200 ${
              isDangerous
                ? "bg-red-500 text-white border border-red-500 hover:bg-red-600 hover:border-red-600"
                : "bg-[#7650e3] text-white border border-[#7650e3] hover:bg-[#d7d7fc] hover:text-[#7650e3] hover:border-[#7650e3]"
            }`}
          >
            {confirmText}
          </button>
        </div>

        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none">
          <div
            className="absolute -top-10 -right-10 w-20 h-20 bg-purple-300/10 rounded-full animate-ping"
            style={{ animationDuration: "3s" }}
          />
          <div
            className="absolute -bottom-10 -left-10 w-20 h-20 bg-purple-300/10 rounded-full animate-ping"
            style={{ animationDuration: "4s", animationDelay: "1s" }}
          />
        </div>
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ConfirmDialog;
