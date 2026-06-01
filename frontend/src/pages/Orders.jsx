import { useState, useEffect } from 'react';
import { ordersApi, customersApi, productsApi } from '../api';
import { useToast } from '../context/ToastContext';
import ConfirmDialog from '../components/ConfirmDialog';
import { Plus, Trash2, ShoppingCart, X, Eye, Search } from 'lucide-react';

function CreateOrderModal({ onClose, onSaved }) {
  const { addToast } = useToast();
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState([{ product_id: '', quantity: 1 }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([customersApi.getAll(), productsApi.getAll()])
      .then(([c, p]) => { setCustomers(c); setProducts(p); });
  }, []);

  const addItem = () => setItems(i => [...i, { product_id: '', quantity: 1 }]);
  const removeItem = (idx) => setItems(i => i.filter((_, ii) => ii !== idx));
  const setItem = (idx, key, val) => setItems(i => i.map((it, ii) => ii === idx ? { ...it, [key]: val } : it));

  const total = items.reduce((sum, it) => {
    const p = products.find(p => p.id === parseInt(it.product_id));
    return sum + (p ? p.price * parseInt(it.quantity || 0) : 0);
  }, 0);

  const handleSubmit = async () => {
    if (!customerId) { setError('Please select a customer.'); return; }
    const validItems = items.filter(i => i.product_id && parseInt(i.quantity) > 0);
    if (validItems.length === 0) { setError('Add at least one item with a valid quantity.'); return; }
    setLoading(true);
    setError('');
    try {
      await ordersApi.create({
        customer_id: parseInt(customerId),
        items: validItems.map(i => ({ product_id: parseInt(i.product_id), quantity: parseInt(i.quantity) })),
      });
      addToast('Order created successfully');
      onSaved();
    } catch (e) {
      setError(e.response?.data?.detail || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 640 }}>
        <div className="modal-header">
          <h3>Create New Order</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label>Customer *</label>
            <select value={customerId} onChange={e => setCustomerId(e.target.value)}>
              <option value="">Select a customer…</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.full_name} — {c.email}</option>)}
            </select>
          </div>

          <label style={{ display: 'block', marginBottom: 10, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>
            Order Items *
          </label>
          <div className="order-items-list">
            {items.map((item, idx) => (
              <div key={idx} className="order-item-row">
                <select value={item.product_id} onChange={e => setItem(idx, 'product_id', e.target.value)}>
                  <option value="">Select product…</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} — ₹{p.price.toFixed(2)} (stock: {p.quantity})
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={e => setItem(idx, 'quantity', e.target.value)}
                  placeholder="Qty"
                />
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => removeItem(idx)}
                  disabled={items.length === 1}
                  style={{ padding: '6px 8px' }}
                >
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>
          <button className="btn btn-ghost btn-sm" onClick={addItem} style={{ marginBottom: 4 }}>
            <Plus size={13} /> Add Item
          </button>
          {total > 0 && (
            <div className="order-total">Total: ₹{total.toFixed(2)}</div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Placing…' : 'Place Order'}
          </button>
        </div>
      </div>
    </div>
  );
}

function OrderDetailModal({ order, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 580 }}>
        <div className="modal-header">
          <h3>Order #{order.id}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>Customer</div>
              <div style={{ fontWeight: 600, color: 'var(--text)' }}>{order.customer?.full_name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{order.customer?.email}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>Status</div>
              <span className={`badge ${order.status === 'pending' ? 'badge-yellow' : 'badge-green'}`}>{order.status}</span>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>Date</div>
              <div style={{ fontSize: 13 }}>{new Date(order.created_at).toLocaleString()}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>Total</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 18, color: 'var(--accent)', fontWeight: 700 }}>₹{order.total_amount.toFixed(2)}</div>
            </div>
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>Items</div>
          <div className="card">
            <table>
              <thead><tr><th>Product</th><th>SKU</th><th>Unit Price</th><th>Qty</th><th>Subtotal</th></tr></thead>
              <tbody>
                {order.items.map(item => (
                  <tr key={item.id}>
                    <td><strong>{item.product?.name || `Product #${item.product_id}`}</strong></td>
                    <td><span className="mono badge badge-gray">{item.product?.sku || '—'}</span></td>
                    <td className="mono">₹{item.unit_price.toFixed(2)}</td>
                    <td>{item.quantity}</td>
                    <td className="mono">₹{(item.unit_price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewOrder, setViewOrder] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); 
  const [sortBy, setSortBy] = useState('date-desc');
  const { addToast } = useToast();

  const load = () => {
    setLoading(true);
    ordersApi.getAll().then(setOrders).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async () => {
    try {
      await ordersApi.delete(deleteTarget.id);
      addToast('Order cancelled and stock restored');
      setDeleteTarget(null);
      load();
    } catch (e) {
      addToast(e.response?.data?.detail || 'Cancel failed', 'error');
      setDeleteTarget(null);
    }
  };

  const filteredOrders = orders
    .filter(o => {
      const query = search.toLowerCase();
      const matchesSearch = 
        String(o.id).includes(query) ||
        (o.customer?.full_name && o.customer.full_name.toLowerCase().includes(query)) ||
        (o.customer?.email && o.customer.email.toLowerCase().includes(query));

      const matchesStatus = statusFilter === 'all' || o.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === 'date-asc') return new Date(a.created_at) - new Date(b.created_at);
      if (sortBy === 'total-desc') return b.total_amount - a.total_amount;
      if (sortBy === 'total-asc') return a.total_amount - b.total_amount;
      if (sortBy === 'id-desc') return b.id - a.id;
      return 0;
    });

  const isFiltered = search !== '' || statusFilter !== 'all';

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h2>Orders</h2>
          <p>
            {isFiltered 
              ? `Showing ${filteredOrders.length} of ${orders.length} orders` 
              : `${orders.length} total orders`}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <Plus size={15} /> Create Order
        </button>
      </div>
      <div className="page-body">
        <div className="filter-bar">
          <div className="search-input-wrap">
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Search orders by customer or ID..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>
          <select 
            className="filter-select" 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
          <select 
            className="filter-select" 
            value={sortBy} 
            onChange={e => setSortBy(e.target.value)}
          >
            <option value="date-desc">Newest Orders</option>
            <option value="date-asc">Oldest Orders</option>
            <option value="total-desc">Total (High to Low)</option>
            <option value="total-asc">Total (Low to High)</option>
            <option value="id-desc">Order ID</option>
          </select>
        </div>

        <div className="card">
          {loading ? (
            <div className="loading"><div className="spinner" /> Loading…</div>
          ) : filteredOrders.length === 0 ? (
            <div className="empty-state">
              <ShoppingCart size={40} />
              <h4>{isFiltered ? 'No matches found' : 'No orders yet'}</h4>
              <p>{isFiltered ? 'Try adjusting your search or filters' : 'Click "Create Order" to place the first order'}</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(o => (
                    <tr key={o.id}>
                      <td className="mono" style={{ color: 'var(--text-muted)' }}>#{o.id}</td>
                      <td><strong>{o.customer?.full_name || `#${o.customer_id}`}</strong></td>
                      <td>{o.items.length} item{o.items.length !== 1 ? 's' : ''}</td>
                      <td className="mono" style={{ color: 'var(--accent)', fontWeight: 600 }}>₹{o.total_amount.toFixed(2)}</td>
                      <td>
                        <span className={`badge ${o.status === 'pending' ? 'badge-yellow' : 'badge-green'}`}>
                          {o.status}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                        {new Date(o.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => setViewOrder(o)}>
                            <Eye size={13} />
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(o)}>
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

      {showCreate && (
        <CreateOrderModal onClose={() => setShowCreate(false)} onSaved={() => { setShowCreate(false); load(); }} />
      )}
      {viewOrder && <OrderDetailModal order={viewOrder} onClose={() => setViewOrder(null)} />}
      {deleteTarget && (
        <ConfirmDialog
          message={`Cancel order #${deleteTarget.id}? Stock will be restored automatically.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

