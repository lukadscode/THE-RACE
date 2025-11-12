import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from './App.jsx';
import Admin from './routes/Admin.jsx';
import Display3D from './routes/Display3D.jsx';
import Display2D from './routes/Display2D.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route element={<App />}>
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/display/3d" element={<Display3D />} />
        <Route path="/display/2d" element={<Display2D />} />
      </Route>
    </Routes>
  </BrowserRouter>
);
