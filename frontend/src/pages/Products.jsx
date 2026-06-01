import { useState, useEffect } from 'react';
import { productsApi } from '../api';
import { useToast } from '../context/ToastContext';
import ConfirmDialog from '../components/ConfirmDialog';
import { Plus, Pencil, Trash2, Package } from 'lucide-react';

function ProductModal({ product, onClose, onSaved }) {
  const { addToast } = useToast();
  const [form, setForm] = useState({
    name: product?.name || '',
    sku: product?.sku || '',
    price: product?.price || '',
    quantity: product?.quantity ?? '',
    description: product?.description || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name || !form.sku || form.price === '' || form.quantity === '') {
      setError('Name, SKU, price, and quantity are required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = { ...form, price: parseFloat(form.price), quantity: parseInt(form.quantity) };
      if (product) {
        await productsApi.update(product.id, { name: data.name, price: data.price, quantity: data.quantity, description: data.description });
        addToast('Product updated successfully');
      } else {
        await productsApi.create(data);
        addToast('Product created successfully');
      }
      onSaved();
    } catch (e) {
      setError(e.response?.data?.detail || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>{product ? 'Edit Product' : 'Add New Product'}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-grid">
            <div className="form-group">
              <label>Product Name *</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Wireless Keyboard" />
            </div>
            <div className="form-group">
              <label>SKU / Code *</label>
              <input value={form.sku} onChange={e => set('sku', e.target.value)} placeholder="e.g. WK-001" disabled={!!product} />
            </div>
            <div className="form-group">
              <label>Price (₹) *</label>
              <input type="number" min="0" step="0.01" value={form.price} onChange={e => set('price', e.target.value)} placeholder="0.00" />
            </div>
            <div className="form-group">
              <label>Stock Quantity *</label>
              <input type="number" min="0" value={form.quantity} onChange={e => set('quantity', e.target.value)} placeholder="0" />
            </div>
            <div className="form-group full">
              <label>Description</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Optional description…" />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving…' : product ? 'Save Changes' : 'Add Product'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); 
  const [deleteTarget, setDeleteTarget] = useState(null);
  const { addToast } = useToast();

  const load = () => {
    setLoading(true);
    productsApi.getAll().then(setProducts).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async () => {
    try {
      await productsApi.delete(deleteTarget.id);
      addToast('Product deleted');
      setDeleteTarget(null);
      load();
    } catch (e) {
      addToast(e.response?.data?.detail || 'Delete failed', 'error');
      setDeleteTarget(null);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h2>Products</h2>
          <p>{products.length} total products</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('create')}>
          <Plus size={15} /> Add Product
        </button>
      </div>
      <div className="page-body">
        <div className="card">
          {loading ? (
            <div className="loading"><div className="spinner" /> Loading…</div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <Package size={40} />
              <h4>No products yet</h4>
              <p>Click "Add Product" to get started</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>SKU</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id}>
                      <td><strong>{p.name}</strong></td>
                      <td><span className="mono badge badge-gray">{p.sku}</span></td>
                      <td className="mono">₹{p.price.toFixed(2)}</td>
                      <td>
                        <span className={`badge ${p.quantity === 0 ? 'badge-red' : p.quantity <= 10 ? 'badge-warning' : 'badge-green'}`}>
                          {p.quantity}
                        </span>
                      </td>
                      <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.description || '—'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => setModal(p)}>
                            <Pencil size={13} />
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(p)}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {modal && (
        <ProductModal
          product={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load(); }}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`Are you sure you want to delete "${deleteTarget.name}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
