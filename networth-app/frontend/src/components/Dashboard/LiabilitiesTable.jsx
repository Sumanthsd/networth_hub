import { useState } from 'react';
import LiabilityFormModal from './LiabilityFormModal.jsx';
import DeleteConfirmDialog from './DeleteConfirmDialog.jsx';

function formatCurrency(value) {
  return value.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  });
}

export default function LiabilitiesTable({
  liabilities,
  onCreate,
  onUpdate,
  onDelete,
  loading,
}) {
  const [modalState, setModalState] = useState(null);
  const [deleteState, setDeleteState] = useState(null);

  const openCreate = () => setModalState({ mode: 'create', liability: null });
  const openEdit = (liability) => setModalState({ mode: 'edit', liability });

  const closeModal = () => setModalState(null);
  const closeDelete = () => setDeleteState(null);

  async function handleSubmit(payload) {
    if (modalState.mode === 'create') {
      await onCreate(payload);
    } else if (modalState.mode === 'edit' && modalState.liability) {
      await onUpdate(modalState.liability.id, payload);
    }
    closeModal();
  }

  async function handleConfirmDelete() {
    if (!deleteState) return;
    await onDelete(deleteState.id);
    closeDelete();
  }

  return (
    <div className="card">
      <div className="flex justify-between items-center">
        <div>
          <div className="card-title">Liabilities</div>
          <div className="card-sub">
            Loans, borrowings and other obligations.
          </div>
        </div>
        <button className="btn btn-outline" type="button" onClick={openCreate}>
          + Add Liability
        </button>
      </div>
      <div className="mt-sm" style={{ overflowX: 'auto' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Name</th>
              <th>Amount</th>
              <th>Notes</th>
              <th>Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {liabilities.map((liability) => (
              <tr key={liability.id}>
                <td>
                  <span className="chip">{liability.category}</span>
                </td>
                <td>{liability.name}</td>
                <td className="tag-negative">
                  {formatCurrency(Number(liability.amount || 0))}
                </td>
                <td className="muted" style={{ maxWidth: 160 }}>
                  {liability.notes || '-'}
                </td>
                <td className="muted" style={{ fontSize: '0.75rem' }}>
                  {liability.created_at || liability.createdAt}
                </td>
                <td>
                  <div className="table-actions">
                    <button
                      className="btn btn-outline"
                      type="button"
                      onClick={() => openEdit(liability)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-outline"
                      type="button"
                      onClick={() =>
                        setDeleteState({ id: liability.id, name: liability.name })
                      }
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && liabilities.length === 0 && (
              <tr>
                <td colSpan="6" className="muted">
                  No liabilities yet. Import from Google Sheet or add manually.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {modalState && (
        <LiabilityFormModal
          mode={modalState.mode}
          initialValues={modalState.liability}
          onSubmit={handleSubmit}
          onClose={closeModal}
        />
      )}
      {deleteState && (
        <DeleteConfirmDialog
          label={deleteState.name}
          onConfirm={handleConfirmDelete}
          onCancel={closeDelete}
        />
      )}
    </div>
  );
}

