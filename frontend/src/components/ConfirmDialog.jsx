import Modal from './Modal';

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  tone = 'default',
  isProcessing = false,
  onConfirm,
  onCancel,
}) {
  const confirmStyles =
    tone === 'danger'
      ? 'bg-alert-600 hover:bg-alert-600/90'
      : 'bg-blueprint-900 hover:bg-blueprint-800';

  return (
    <Modal title={title} onClose={onCancel}>
      <div data-testid="confirm-dialog">
        <p data-testid="confirm-message" className="text-sm text-asphalt-600 mb-6">
          {message}
        </p>
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            data-testid="confirm-cancel"
            onClick={onCancel}
            disabled={isProcessing}
            className="px-4 py-2 rounded-md text-sm font-medium text-asphalt-600
              border border-asphalt-100 hover:bg-asphalt-50 transition-colors disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            data-testid="confirm-accept"
            onClick={onConfirm}
            disabled={isProcessing}
            className={`px-4 py-2 rounded-md text-sm font-medium text-white transition-colors
              disabled:opacity-60 disabled:cursor-not-allowed ${confirmStyles}`}
          >
            {isProcessing ? 'Procesando…' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
