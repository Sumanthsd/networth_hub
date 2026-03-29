import { createPortal } from 'react-dom';

export default function AssetFormModal({
  mode,
  initialValues,
  onSubmit,
  onClose,
}) {
  const isEdit = mode === 'edit';

  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = {
      category: formData.get('category') || '',
      name: formData.get('name') || '',
      amount: Number(formData.get('amount') || 0),
      notes: formData.get('notes') || '',
    };
    await onSubmit(payload);
  }

  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            {isEdit ? 'Edit Asset' : 'Add Asset'}
          </div>
          <button className="btn btn-outline" type="button" onClick={onClose}>
            Close
          </button>
        </div>
        <form className="form-grid" onSubmit={handleSubmit}>
          <div>
            <label className="label">Category</label>
            <input
              className="input"
              name="category"
              defaultValue={initialValues?.category || ''}
              placeholder="Equity, Bank, Real Estate..."
              required
            />
          </div>
          <div>
            <label className="label">Name</label>
            <input
              className="input"
              name="name"
              defaultValue={initialValues?.name || ''}
              placeholder="Zerodha, Savings Account..."
              required
            />
          </div>
          <div>
            <label className="label">Amount</label>
            <input
              className="input"
              name="amount"
              type="number"
              min="0"
              step="0.01"
              defaultValue={initialValues?.amount ?? ''}
              required
            />
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea
              className="textarea"
              name="notes"
              rows="3"
              defaultValue={initialValues?.notes || ''}
              placeholder="Optional notes about this asset"
            />
          </div>
          <div className="flex justify-between mt-sm">
            <span className="muted" style={{ fontSize: '0.75rem' }}>
              Amounts are treated as INR by default.
            </span>
            <button className="btn btn-primary" type="submit">
              {isEdit ? 'Save changes' : 'Add asset'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

