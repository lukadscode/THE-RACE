import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';

export default function App() {
  const loc = useLocation();
  return (
    <div className="layout">
      <header className="topbar">
        <Link to="/" className="brand">🏁 ErgKart</Link>
        <nav>
          <Link className={loc.pathname === '/' ? 'active' : ''} to="/">Home</Link>
          <Link className={loc.pathname.includes('/admin') ? 'active' : ''} to="/admin">Admin</Link>
          <Link className={loc.pathname.includes('/display/3d') ? 'active' : ''} to="/display/3d">Vue 3D</Link>
          <Link className={loc.pathname.includes('/display/2d') ? 'active' : ''} to="/display/2d">Vue 2D</Link>
        </nav>
      </header>
      <Outlet />
    </div>
  );
}
