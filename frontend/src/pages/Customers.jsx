import { useState, useEffect } from 'react';
import { customersApi } from '../api';
import { useToast } from '../context/ToastContext';
import ConfirmDialog from '../components/ConfirmDialog';
import { Plus, Trash2, Users, Search } from 'lucide-react';

function CustomerModal({ onClose, onSaved }) {
  const { addToast } = useToast();
  const [form, setForm] = useState({ full_name: '', email: '', phone_number: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.full_name || !form.email) {
      setError('Full name and email are required.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await customersApi.create(form);
      addToast('Customer added successfully');
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
          <h3>Add New Customer</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-grid">
            <div className="form-group full">
              <label>Full Name *</label>
              <input value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="e.g. Jane Smith" />
            </div>
            <div className="form-group">
              <label>Email Address *</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="jane@example.com" />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input value={form.phone_number} onChange={e => set('phone_number', e.target.value)} placeholder="+1 555 000 0000" />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving…' : 'Add Customer'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name-asc');
  const { addToast } = useToast();

  const load = () => {
    setLoading(true);
    customersApi.getAll().then(setCustomers).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async () => {
    try {
      await customersApi.delete(deleteTarget.id);
      addToast('Customer deleted');
      setDeleteTarget(null);
      load();
    } catch (e) {
      addToast(e.response?.data?.detail || 'Delete failed', 'error');
      setDeleteTarget(null);
    }
  };

  const filteredCustomers = customers
    .filter(c => {
      const query = search.toLowerCase();
      return (
        c.full_name.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query) ||
        (c.phone_number && c.phone_number.toLowerCase().includes(query))
      );
    })
    .sort((a, b) => {
      if (sortBy === 'name-asc') return a.full_name.localeCompare(b.full_name);
      if (sortBy === 'name-desc') return b.full_name.localeCompare(a.full_name);
      if (sortBy === 'date-desc') return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === 'date-asc') return new Date(a.created_at) - new Date(b.created_at);
      if (sortBy === 'id-asc') return a.id - b.id;
      return 0;
    });

  const isFiltered = search !== '';

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h2>Customers</h2>
          <p>
            {isFiltered 
              ? `Showing ${filteredCustomers.length} of ${customers.length} customers` 
              : `${customers.length} registered customers`}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={15} /> Add Customer
        </button>
      </div>
      <div className="page-body">
        <div className="filter-bar">
          <div className="search-input-wrap">
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Search customers by name, email, phone..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>
          <select 
            className="filter-select" 
            value={sortBy} 
            onChange={e => setSortBy(e.target.value)}
          >
            <option value="name-asc">Name (A to Z)</option>
            <option value="name-desc">Name (Z to A)</option>
            <option value="date-desc">Newest Joined</option>
            <option value="date-asc">Oldest Joined</option>
            <option value="id-asc">Customer ID</option>
          </select>
        </div>

        <div className="card">
          {loading ? (
            <div className="loading"><div className="spinner" /> Loading…</div>
          ) : filteredCustomers.length === 0 ? (
            <div className="empty-state">
              <Users size={40} />
              <h4>{isFiltered ? 'No matches found' : 'No customers yet'}</h4>
              <p>{isFiltered ? 'Try adjusting your search criteria' : 'Click "Add Customer" to get started'}</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map(c => (
                    <tr key={c.id}>
                      <td className="mono" style={{ color: 'var(--text-muted)' }}>#{c.id}</td>
                      <td><strong>{c.full_name}</strong></td>
                      <td>{c.email}</td>
                      <td>{c.phone_number || '—'}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                        {new Date(c.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(c)}>
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <CustomerModal onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); load(); }} />
      )}
      {deleteTarget && (
        <ConfirmDialog
          message={`Delete customer "${deleteTarget.full_name}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

