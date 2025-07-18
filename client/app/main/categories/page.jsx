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
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => startEdit(category)}
                    >
                      Modifier
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleDelete(category.id)}
                    >
                      Supprimer
                    </Button>
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
