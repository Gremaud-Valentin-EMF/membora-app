"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import apiService from "../../../lib/api";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Input from "../../../components/ui/Input";

export default function CategoriesPage() {
  const { user, tenant } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nom: "",
    description: "",
  });

  useEffect(() => {
    if (user?.role === "sous-admin") {
      loadCategories();
    }
  }, [user]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const categoriesData = await apiService.getCategories();
      setCategories(categoriesData);
    } catch (err) {
      setError("Erreur lors du chargement des catégories");
      console.error("Error loading categories:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      // Inclure le tenant_id de l'utilisateur connecté
      const categoryData = {
        ...formData,
        tenant_id: user.tenant_id,
      };
      await apiService.createCategory(categoryData);
      setFormData({ nom: "", description: "" });
      setIsCreating(false);
      await loadCategories();
    } catch (err) {
      setError("Erreur lors de la création de la catégorie");
      console.error("Error creating category:", err);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      // Inclure le tenant_id de l'utilisateur connecté
      const categoryData = {
        ...formData,
        tenant_id: user.tenant_id,
      };
      await apiService.updateCategory(editingId, categoryData);
      setFormData({ nom: "", description: "" });
      setEditingId(null);
      await loadCategories();
    } catch (err) {
      setError("Erreur lors de la modification de la catégorie");
      console.error("Error updating category:", err);
    }
  };

  const handleDelete = async (categoryId) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ?")) {
      return;
    }

    try {
      await apiService.deleteCategory(categoryId);
      await loadCategories();
    } catch (err) {
      setError("Erreur lors de la suppression de la catégorie");
      console.error("Error deleting category:", err);
    }
  };

  const startEdit = (category) => {
    setEditingId(category.id);
    setFormData({
      nom: category.nom,
      description: category.description || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ nom: "", description: "" });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Non spécifié";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (user?.role !== "sous-admin") {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Accès refusé
            </h1>
            <p className="text-gray-600">
              Vous n'avez pas les permissions nécessaires pour accéder à cette
              page.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card>
        <div className="text-center mb-8">
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: tenant?.primary_color || "#00AF00" }}
          >
            Gestion des Catégories
          </h1>
          <p className="text-gray-600">Gérez les catégories d'événements</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Bouton pour créer une nouvelle catégorie */}
        {!isCreating && !editingId && (
          <div className="mb-6">
            <Button
              onClick={() => setIsCreating(true)}
              primaryColor={tenant?.primary_color || "#00AF00"}
            >
              Créer une nouvelle catégorie
            </Button>
          </div>
        )}

        {/* Formulaire de création/modification */}
        {(isCreating || editingId) && (
          <div className="mb-6 p-4 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-medium mb-4">
              {editingId
                ? "Modifier la catégorie"
                : "Créer une nouvelle catégorie"}
            </h3>
            <form onSubmit={editingId ? handleUpdate : handleCreate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom de la catégorie
                  </label>
                  <Input
                    type="text"
                    value={formData.nom}
                    onChange={(e) =>
                      setFormData({ ...formData, nom: e.target.value })
                    }
                    placeholder="Nom de la catégorie"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (optionnel)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Description de la catégorie"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows="3"
                  />
                </div>
                <div className="flex space-x-3">
                  <Button
                    type="submit"
                    primaryColor={tenant?.primary_color || "#00AF00"}
                  >
                    {editingId ? "Modifier" : "Créer"}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={
                      editingId ? cancelEdit : () => setIsCreating(false)
                    }
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Liste des catégories */}
        {categories.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              Aucune catégorie créée pour le moment
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {categories.map((category) => (
              <div
                key={category.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">
                      {category.nom}
                    </h3>
                    {category.description && (
                      <p className="text-gray-600 mt-1">
                        {category.description}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 mt-2">
                      Créée le {formatDate(category.created_at)}
                    </p>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors"
                      onClick={() => startEdit(category)}
                      title="Modifier la catégorie"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                      onClick={() => handleDelete(category.id)}
                      title="Supprimer la catégorie"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
