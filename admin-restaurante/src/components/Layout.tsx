import { NavLink, Outlet } from 'react-router-dom';
import { useState } from 'react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/mesas', label: 'Mesas', icon: '🪑' },
  { path: '/reservas', label: 'Reservas', icon: '📅' },
  { path: '/hoy', label: 'Hoy', icon: '📌' },
  { path: '/semana', label: 'Semana', icon: '📆' },
  { path: '/estadisticas', label: 'Estadísticas', icon: '📈' },
  { path: '/clientes', label: 'Clientes', icon: '👥' },
  { path: '/chat', label: 'Chat AI', icon: '💬' },
];

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="layout">
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">🍽️</span>
            <h1>La Terraza Mediterránea</h1>
          </div>
          <button 
            className="menu-toggle" 
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
          <nav className={`nav ${menuOpen ? 'nav-open' : ''}`}>
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => 
                  `nav-link ${isActive ? 'nav-link-active' : ''}`
                }
                onClick={() => setMenuOpen(false)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
