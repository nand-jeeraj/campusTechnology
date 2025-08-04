import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./auth/Login";
import FaceLogin from "./auth/FaceLogin";
import AttendanceOptions from "./auth/AttendanceOptions"; 
import Register from "./auth/Register";
import AuthNav from "./AuthNav";
import api from "./services/api";
import { AuthContext } from "./Authcontext";
import axios from "axios";

export default function AuthApp() {
  const [authenticated, setAuthenticated] = useState(null);

  const checkAuth = () => {
    axios.get("/check-auth")
      .then(() => {
        setAuthenticated(true);
        localStorage.setItem("authenticated", "true");
      })
      .catch(() => {
        setAuthenticated(false);
        localStorage.removeItem("authenticated");
      });
  };

  useEffect(() => {
    checkAuth();
  }, []);

  if (authenticated === null) return <div>Loading…</div>;

  return (
    <AuthContext.Provider value={{ authenticated, setAuthenticated, checkAuth }}>
      <Routes>
        <Route path="/auth" element={<AuthNav />}>
          <Route index element={<AttendanceOptions />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/face-login" element={<FaceLogin />} />
          <Route path="/auth/login-options" element={<AttendanceOptions />} />
          <Route path="/auth/register" element={<Register />} />
        </Route>
      </Routes>
    </AuthContext.Provider>
  );
}