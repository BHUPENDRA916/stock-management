import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, Users, ShoppingCart } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard },
  { label: 'Products', to: '/products', icon: Package },
  { label: 'Customers', to: '/customers', icon: Users },
  { label: 'Orders', to: '/orders', icon: ShoppingCart },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-mark">
          <div className="logo-dot">IO</div>
          <h1>Inventory<br />& Orders</h1>
        </div>
        <div className="version">v1.0.0</div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Navigation</div>
        {navItems.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <Icon size={15} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
