"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../../../../contexts/AuthContext";
import apiService from "../../../../../lib/api";
import Input from "../../../../../components/ui/Input";
import Button from "../../../../../components/ui/Button";
import Card from "../../../../../components/ui/Card";
import Link from "next/link";

export default function EditEventPage() {
  const { id } = useParams();
  const { user, tenant } = useAuth();
  const router = useRouter();

  const [event, setEvent] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    nom: "",
    date: "",
    categorie_id: "",
    statut: "planifié",
    tenant_id: user?.tenant_id,
  });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [eventData, categoriesData] = await Promise.all([
        apiService.getEvent(id),
        apiService.getCategories(),
      ]);

      setEvent(eventData);

      // Formater la date pour l'input datetime-local
      const eventDate = new Date(eventData.date);
      const formattedDate = eventDate.toISOString().slice(0, 16);

      setFormData({
        nom: eventData.nom,
        date: formattedDate,
        categorie_id: eventData.categorie_id?.toString() || "",
        statut: eventData.statut,
        tenant_id: eventData.tenant_id,
      });

      const filteredCategories = categoriesData.filter(
        (cat) => cat.tenant_id === user.tenant_id
      );
      setCategories(filteredCategories);
    } catch (err) {
      setError("Erreur lors du chargement de l'événement");
      console.error("Error loading event:", err);
    } finally {
      setLoading(false);
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
    setSaving(true);

    try {
      // Inclure le tenant_id de l'utilisateur connecté
      const eventData = {
        ...formData,
        tenant_id: user.tenant_id,
      };
      await apiService.updateEvent(id, eventData);
      router.push(`/main/events/${id}`);
    } catch (err) {
      setError(err.message || "Erreur lors de la mise à jour de l'événement");
      console.error("Error updating event:", err);
    } finally {
      setSaving(false);
    }
  };

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

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Événement non trouvé
          </h1>
          <Link href="/main/events">
            <Button primaryColor={tenant?.primary_color || "#00AF00"}>
              Retour aux événements
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link
          href={`/main/events/${id}`}
          className="text-green-600 hover:text-green-500 mb-4 inline-block"
        >
          ← Retour à l'événement
        </Link>
        <h1
          className="text-3xl font-bold"
          style={{ color: tenant?.primary_color || "#00AF00" }}
        >
          Modifier l'événement
        </h1>
        <p className="text-gray-600 mt-2">
          Modifiez les informations de l'événement
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
              disabled={saving}
              primaryColor={tenant?.primary_color || "#00AF00"}
              className="flex-1"
            >
              {saving ? "Sauvegarde..." : "Sauvegarder"}
            </Button>

            <Link href={`/main/events/${id}`} className="flex-1">
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
