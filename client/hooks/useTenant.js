"use client";

import { useState, useEffect } from "react";
import apiService from "../lib/api";

export function useTenant() {
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTenant();
  }, []);

  const loadTenant = async () => {
    try {
      setLoading(true);
      setError(null);

      // Détecter le sous-domaine depuis l'URL
      const hostname = window.location.hostname;
      const subdomain = hostname.split(".")[0];

      console.log("🔍 Debug useTenant:");
      console.log("  - hostname:", hostname);
      console.log("  - subdomain:", subdomain);
      console.log("  - full URL:", window.location.href);

      let tenantData = null;

      // Si on a un sous-domaine (pas localhost direct)
      if (
        subdomain &&
        subdomain !== "localhost" &&
        subdomain !== "127" &&
        subdomain !== "www"
      ) {
        console.log(
          "  - Tentative de chargement du tenant par slug:",
          subdomain
        );
        try {
          tenantData = await apiService.getTenantBySlug(subdomain);
          console.log("  - Tenant trouvé:", tenantData);
        } catch (err) {
          console.error("  - Erreur lors du chargement du tenant:", err);
          setError(`Organisation "${subdomain}" non trouvée`);
        }
      } else {
        console.log("  - Utilisation du tenant par défaut (ID 6)");
        // Fallback vers le tenant par défaut (ID 6 - "Jeunesse du Pâquier")
        try {
          tenantData = await apiService.getTenant(6);
          console.log("  - Tenant par défaut trouvé:", tenantData);
        } catch (err) {
          console.error(
            "  - Erreur lors du chargement du tenant par défaut:",
            err
          );
          setError("Erreur lors du chargement de l'organisation");
        }
      }

      setTenant(tenantData);
    } catch (err) {
      console.error("Error loading tenant:", err);
      setError("Erreur lors du chargement de l'organisation");
    } finally {
      setLoading(false);
    }
  };

  return { tenant, loading, error, reloadTenant: loadTenant };
}
