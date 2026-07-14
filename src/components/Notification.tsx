import React, { useEffect } from "react";
import { Check, AlertCircle, X } from "lucide-react";

interface ToastProps {
  message: string;
  type: "success" | "info" | "warning";
  onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgStyles = {
    success: "bg-charcoal-deep text-warm-cream border-emerald-500/30",
    info: "bg-charcoal-deep text-warm-cream border-blue-500/30",
    warning: "bg-charcoal-deep text-warm-cream border-amber-500/30"
  }[type];

  const Icon = {
    success: Check,
    info: AlertCircle,
    warning: AlertCircle
  }[type];

  return (
    <div
      id="app-toast"
      role="alert"
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg max-w-sm animate-in fade-in slide-in-from-bottom-5 duration-300 ${bgStyles}`}
    >
      <Icon className="w-5 h-5 flex-shrink-0 text-amber-100" />
      <p className="text-sm font-medium font-sans">{message}</p>
      <button
        onClick={onClose}
        className="ml-auto p-1 rounded-md text-charcoal-light hover:text-warm-cream hover:bg-warm-cream/10 transition-colors"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
