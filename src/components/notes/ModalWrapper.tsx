"use client";

import { useRef, useEffect } from "react";

interface ModalWrapperProps {
  onClose: () => void;
  children: React.ReactNode;
}

export default function ModalWrapper({ onClose, children }: ModalWrapperProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6 sm:p-8 md:p-10 overflow-y-auto">
      <div
        ref={modalRef}
        className="w-full max-w-4xl bg-white dark:bg-dark-secondary rounded-xl shadow-xl overflow-hidden transition-all duration-300 animate-fadeIn"
        style={{ maxHeight: "calc(100vh - 4rem)" }}
      >
        {children}
      </div>
    </div>
  );
}
