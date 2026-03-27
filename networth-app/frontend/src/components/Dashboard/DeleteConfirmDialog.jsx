export default function DeleteConfirmDialog({ label, onConfirm, onCancel }) {
  async function handleConfirm() {
    await onConfirm();
  }

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Delete entry</div>
          <button className="btn btn-outline" type="button" onClick={onCancel}>
            Cancel
          </button>
        </div>
        <p className="muted" style={{ fontSize: '0.85rem' }}>
          Are you sure you want to delete{' '}
          <span style={{ color: '#e5e7eb' }}>{label}</span>? This action cannot
          be undone.
        </p>
        <div className="flex justify-between mt-md">
          <span className="muted" style={{ fontSize: '0.75rem' }}>
            You can always re-import from your Google Sheet later.
          </span>
          <button className="btn btn-danger" type="button" onClick={handleConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

