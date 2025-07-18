"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import apiService from "../lib/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté au chargement
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    const tenantData = localStorage.getItem("tenant");

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);

        if (tenantData) {
          const parsedTenant = JSON.parse(tenantData);
          setTenant(parsedTenant);
        } else if (parsedUser.tenant_id) {
          // Charger les données du tenant
          loadTenantData(parsedUser.tenant_id);
        }
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        logout();
      }
    }
    setLoading(false);
  }, []);

  const loadTenantData = async (tenantId) => {
    try {
      const tenantData = await apiService.getTenant(tenantId);
      setTenant(tenantData);
      localStorage.setItem("tenant", JSON.stringify(tenantData));
    } catch (error) {
      console.error("Error loading tenant data:", error);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await apiService.login(credentials);
      const { membre, token } = response;

      // Stocker les données
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(membre));

      setUser(membre);

      // Charger les données du tenant
      if (membre.tenant_id) {
        await loadTenantData(membre.tenant_id);
      }

      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await apiService.register(userData);
      return { success: true, data: response };
    } catch (error) {
      console.error("Register error:", error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    // Supprimer les données stockées
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("tenant");

    // Réinitialiser l'état
    setUser(null);
    setTenant(null);

    // Rediriger vers la page de connexion
    router.push("/auth/login");
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const updateTenant = (tenantData) => {
    setTenant(tenantData);
    localStorage.setItem("tenant", JSON.stringify(tenantData));
  };

  const value = {
    user,
    tenant,
    loading,
    login,
    register,
    logout,
    updateUser,
    updateTenant,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
