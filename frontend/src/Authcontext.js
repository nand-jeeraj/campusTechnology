// src/Authcontext.jsx
import React, { createContext, useEffect, useState } from "react";
import api from "./services/api";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(
    localStorage.getItem("authenticated") === "true"
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await axios.get("/check-auth");
        setAuthenticated(res.data?.status === "ok");
      } catch {
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    // Only check if we have a token
    const token = localStorage.getItem("token");
    if (token) check();
    else setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ authenticated, setAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
