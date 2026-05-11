import React, { useEffect, useRef, useCallback } from 'react';

interface ModalProps {
  children: React.ReactNode;
  onClose: () => void;
  title?: string;
  maxWidth?: string;
}

const Modal: React.FC<ModalProps> = ({ children, onClose, title, maxWidth = 'max-w-lg' }) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  // Store previously focused element and focus the modal
  useEffect(() => {
    previousFocus.current = document.activeElement as HTMLElement;
    contentRef.current?.focus();

    return () => {
      previousFocus.current?.focus();
    };
  }, []);

  // Escape key closes modal
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
      return;
    }

    // Focus trap
    if (e.key === 'Tab' && contentRef.current) {
      const focusable = contentRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Content */}
      <div
        ref={contentRef}
        className={`relative ${maxWidth} w-full mx-4`}
        tabIndex={-1}
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-700 to-amber-600" style={{
            clipPath: 'polygon(0 0, 100% 0, 100% 3px, 3px 3px, 3px calc(100% - 3px), 100% calc(100% - 3px), 100% 100%, 0 100%, 0 calc(100% - 3px), calc(100% - 3px) calc(100% - 3px), calc(100% - 3px) 3px, 0 3px)'
          }} />
          <div className="absolute inset-[3px] bg-black" />

          <div className="relative p-6 font-pixel">
            {/* Header */}
            {title && (
              <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-gray-800">
                <h2 id="modal-title" className="text-amber-400 text-[10px] tracking-widest">{title}</h2>
                <button
                  onClick={onClose}
                  className="text-gray-600 hover:text-gray-300 text-[12px] transition-colors"
                  aria-label="Close modal"
                >
                  ✕
                </button>
              </div>
            )}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
