// src/components/layout/StudentLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../common/Navbar';

export default function StudentLayout() {
  return (
    <div>
      <Navbar role="Student" />
      <div className="Student-content">
        <Outlet />
      </div>
    </div>
  );
}