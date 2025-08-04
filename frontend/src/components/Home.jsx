// src/components/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div>
      <h1>Welcome to Quiz & Assignment System</h1>
      <div>
        <Link to="/login">Login</Link> to continue
      </div>
    </div>
  );
}