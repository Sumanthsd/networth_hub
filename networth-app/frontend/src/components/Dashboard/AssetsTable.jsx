import { useState } from 'react';
import AssetFormModal from './AssetFormModal.jsx';
import DeleteConfirmDialog from './DeleteConfirmDialog.jsx';

function formatCurrency(value) {
  return value.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  });
}

export default function AssetsTable({
  assets,
  onCreate,
  onUpdate,
  onDelete,
  loading,
}) {
  const [modalState, setModalState] = useState(null);
  const [deleteState, setDeleteState] = useState(null);

  const openCreate = () => setModalState({ mode: 'create', asset: null });
  const openEdit = (asset) => setModalState({ mode: 'edit', asset });

  const closeModal = () => setModalState(null);
  const closeDelete = () => setDeleteState(null);

  async function handleSubmit(payload) {
    if (modalState.mode === 'create') {
      await onCreate(payload);
    } else if (modalState.mode === 'edit' && modalState.asset) {
      await onUpdate(modalState.asset.id, payload);
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
          <div className="card-title">Assets</div>
          <div className="card-sub">Your holdings and positive balances.</div>
        </div>
        <button className="btn btn-primary" type="button" onClick={openCreate}>
          + Add Asset
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
            {assets.map((asset) => (
              <tr key={asset.id}>
                <td>
                  <span className="chip">{asset.category}</span>
                </td>
                <td>{asset.name}</td>
                <td className="tag-positive">
                  {formatCurrency(Number(asset.amount || 0))}
                </td>
                <td className="muted" style={{ maxWidth: 160 }}>
                  {asset.notes || '-'}
                </td>
                <td className="muted" style={{ fontSize: '0.75rem' }}>
                  {asset.created_at || asset.createdAt}
                </td>
                <td>
                  <div className="table-actions">
                    <button
                      className="btn btn-outline"
                      type="button"
                      onClick={() => openEdit(asset)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-outline"
                      type="button"
                      onClick={() =>
                        setDeleteState({ id: asset.id, name: asset.name })
                      }
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && assets.length === 0 && (
              <tr>
                <td colSpan="6" className="muted">
                  No assets yet. Import from Google Sheet or add manually.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {modalState && (
        <AssetFormModal
          mode={modalState.mode}
          initialValues={modalState.asset}
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

