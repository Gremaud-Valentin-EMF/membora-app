"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import apiService from "../../../lib/api";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Input from "../../../components/ui/Input";
import Link from "next/link";

export default function ProfilePage() {
  const { user, tenant, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [coches, setCoches] = useState(0);
  const [formData, setFormData] = useState({
    nom: user?.nom || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    loadCoches();
  }, []);

  const loadCoches = async () => {
    try {
      const { total } = await apiService.getCoches(user.id);
      setCoches(total);
    } catch (err) {
      console.error("Error loading coches:", err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const updateData = {
        nom: formData.nom,
        email: formData.email,
      };

      // Si un nouveau mot de passe est fourni
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          setError("Les nouveaux mots de passe ne correspondent pas");
          return;
        }
        if (!formData.currentPassword) {
          setError(
            "Le mot de passe actuel est requis pour changer le mot de passe"
          );
          return;
        }
        updateData.password = formData.newPassword;
      }

      const updatedUser = await apiService.updateMember(user.id, updateData);
      updateUser(updatedUser);

      setSuccess("Profil mis à jour avec succès");

      // Réinitialiser les champs de mot de passe
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (err) {
      setError(err.message || "Erreur lors de la mise à jour du profil");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRoleLabel = (role) => {
    const labels = {
      membre: "Membre",
      responsable: "Responsable",
      "sous-admin": "Sous-administrateur",
    };
    return labels[role] || role;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1
          className="text-3xl font-bold"
          style={{ color: tenant?.primary_color || "#00AF00" }}
        >
          Mon Profil
        </h1>
        <p className="text-gray-600 mt-2">
          Gérez vos informations personnelles
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
          <p className="text-sm text-green-600">{success}</p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Informations du profil */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">
            Informations personnelles
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nom complet"
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              required
            />

            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <div className="pt-4 border-t">
              <h3 className="text-lg font-medium mb-4">
                Changer le mot de passe
              </h3>

              <Input
                label="Mot de passe actuel"
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="Laissez vide pour ne pas changer"
              />

              <Input
                label="Nouveau mot de passe"
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Laissez vide pour ne pas changer"
              />

              <Input
                label="Confirmer le nouveau mot de passe"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Laissez vide pour ne pas changer"
              />
            </div>

            <Button
              type="submit"
              disabled={saving}
              primaryColor={tenant?.primary_color || "#00AF00"}
              className="w-full"
            >
              {saving ? "Sauvegarde..." : "Sauvegarder les modifications"}
            </Button>
          </form>
        </Card>

        {/* Informations du compte */}
        <div className="space-y-6">
          <Card>
            <h2 className="text-xl font-semibold mb-4">
              Informations du compte
            </h2>
            <div className="space-y-3">
              <div>
                <span className="font-medium text-gray-700">Rôle :</span>
                <p className="text-gray-900">{getRoleLabel(user.role)}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">
                  Membre depuis :
                </span>
                <p className="text-gray-900">
                  {user.created_at
                    ? formatDate(user.created_at)
                    : "Date non disponible"}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">
                  Organisation :
                </span>
                <p className="text-gray-900">
                  {tenant?.nom || "Non spécifiée"}
                </p>
              </div>
            </div>
          </Card>

          {/* Coches obtenus */}
          <Card>
            <h2 className="text-xl font-semibold mb-4">Mes coches</h2>
            <p className="text-3xl font-bold text-center text-green-600">{coches}</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
