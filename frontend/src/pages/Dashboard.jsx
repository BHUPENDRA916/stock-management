import { useState, useEffect } from 'react';
import { dashboardApi } from '../api';
import { Package, Users, ShoppingCart, AlertTriangle } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    dashboardApi.getStats()
      .then(setStats)
      .catch(() => setError('Failed to load dashboard stats'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div>
      <div className="page-header"><div className="page-header-left"><h2>Dashboard</h2><p>System overview</p></div></div>
      <div className="page-body"><div className="loading"><div className="spinner" /> Loading stats…</div></div>
    </div>
  );

  if (error) return (
    <div>
      <div className="page-header"><div className="page-header-left"><h2>Dashboard</h2></div></div>
      <div className="page-body"><div className="alert alert-error">{error}</div></div>
    </div>
  );

  const cards = [
    { label: 'Total Products', value: stats.total_products, icon: Package, color: 'yellow' },
    { label: 'Total Customers', value: stats.total_customers, icon: Users, color: 'cyan' },
    { label: 'Total Orders', value: stats.total_orders, icon: ShoppingCart, color: 'green' },
    { label: 'Low Stock Items', value: stats.low_stock_products.length, icon: AlertTriangle, color: 'red' },
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h2>Dashboard</h2>
          <p>Real-time inventory and order overview</p>
        </div>
      </div>
      <div className="page-body">
        <div className="stats-grid">
          {cards.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className={`stat-card ${color}`}>
              <div className="stat-label">{label}</div>
              <div className="stat-value">{value}</div>
              <Icon size={20} style={{ color: 'var(--text-muted)', marginTop: 8 }} />
            </div>
          ))}
        </div>

        {stats.low_stock_products.length > 0 && (
          <div className="card">
            <div className="card-header">
              <h3>⚠ Low Stock Products</h3>
              <span className="badge badge-red">{stats.low_stock_products.length} items</span>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Price</th>
                    <th>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.low_stock_products.map(p => (
                    <tr key={p.id}>
                      <td><strong>{p.name}</strong></td>
                      <td><span className="mono badge badge-gray">{p.sku}</span></td>
                      <td className="mono">₹{p.price.toFixed(2)}</td>
                      <td>
                        <span className={`badge ${p.quantity === 0 ? 'badge-red' : 'badge-warning'}`}>
                          {p.quantity} left
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {stats.low_stock_products.length === 0 && (
          <div className="card">
            <div className="card-body" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>✓</div>
              <p style={{ fontWeight: 700, color: 'var(--success)' }}>All products have sufficient stock</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
