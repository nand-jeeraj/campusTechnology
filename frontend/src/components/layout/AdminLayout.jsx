// src/components/layout/FacultyLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../common/Navbar';

export default function FacultyLayout() {
  return (
    <div>
      <Navbar role="Faculty" />
      <div className="Faculty-content">
        <Outlet />
      </div>
    </div>
  );
}