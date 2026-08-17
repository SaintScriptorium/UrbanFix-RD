import { useEffect } from 'react';


export default function Modal({ title, onClose, children }) {

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-blueprint-950/50 px-4 py-8 overflow-y-auto"
      role="dialog"
      aria-modal="true"

      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-lg shadow-xl my-auto"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-asphalt-100">
          <h2 className="font-display text-lg text-asphalt-800">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="text-asphalt-400 hover:text-asphalt-800 transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>
        <div className="px-5 py-5">{children}</div>
      </div>
    </div>
  );
}
