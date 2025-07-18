"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../contexts/AuthContext";
import apiService from "../../../../lib/api";
import Input from "../../../../components/ui/Input";
import Button from "../../../../components/ui/Button";
import Card from "../../../../components/ui/Card";
import Link from "next/link";

export default function CreateEventPage() {
  const { user, tenant } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    nom: "",
    date: "",
    categorie_id: "",
    statut: "planifié",
    tenant_id: user?.tenant_id,
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const categoriesData = await apiService.getCategories();
      const filteredCategories = categoriesData.filter(
        (cat) => cat.tenant_id === user.tenant_id
      );
      setCategories(filteredCategories);
    } catch (err) {
      setError("Erreur lors du chargement des catégories");
      console.error("Error loading categories:", err);
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
    setLoading(true);

    try {
      // Inclure le tenant_id de l'utilisateur connecté
      const eventData = {
        ...formData,
        tenant_id: user.tenant_id,
      };
      await apiService.createEvent(eventData);
      router.push("/main/dashboard");
    } catch (err) {
      setError(err.message || "Erreur lors de la création de l'événement");
      console.error("Error creating event:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link
          href="/main/dashboard"
          className="text-green-600 hover:text-green-500 mb-4 inline-block"
        >
          ← Retour au dashboard
        </Link>
        <h1
          className="text-3xl font-bold"
          style={{ color: tenant?.primary_color || "#00AF00" }}
        >
          Créer un événement
        </h1>
        <p className="text-gray-600 mt-2">
          Remplissez les informations pour créer un nouvel événement
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <Input
            label="Nom de l'événement"
            type="text"
            name="nom"
            value={formData.nom}
            onChange={handleChange}
            required
            placeholder="Ex: Tournoi de football"
          />

          <Input
            label="Date et heure"
            type="datetime-local"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catégorie
            </label>
            <select
              name="categorie_id"
              value={formData.categorie_id}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Sélectionner une catégorie</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.nom}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statut
            </label>
            <select
              name="statut"
              value={formData.statut}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="planifié">Planifié</option>
              <option value="en cours">En cours</option>
              <option value="terminé">Terminé</option>
              <option value="annulé">Annulé</option>
            </select>
          </div>

          <div className="flex space-x-4">
            <Button
              type="submit"
              disabled={loading}
              primaryColor={tenant?.primary_color || "#00AF00"}
              className="flex-1"
            >
              {loading ? "Création..." : "Créer l'événement"}
            </Button>

            <Link href="/main/dashboard" className="flex-1">
              <Button variant="secondary" className="w-full">
                Annuler
              </Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
