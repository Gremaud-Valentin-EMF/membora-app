"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import apiService from "../../../lib/api";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Link from "next/link";

export default function EventsPage() {
  const { user, tenant } = useAuth();
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [eventsData, categoriesData] = await Promise.all([
        apiService.getEvents(),
        apiService.getCategories(),
      ]);

      // Filtrer par tenant
      const filteredEvents = eventsData.filter(
        (event) => event.tenant_id === user.tenant_id
      );
      const filteredCategories = categoriesData.filter(
        (cat) => cat.tenant_id === user.tenant_id
      );

      setEvents(filteredEvents);
      setCategories(filteredCategories);
    } catch (err) {
      setError("Erreur lors du chargement des données");
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = selectedCategory
    ? events.filter(
        (event) => event.categorie_id === parseInt(selectedCategory)
      )
    : events;

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

  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.nom : "Catégorie inconnue";
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

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1
            className="text-3xl font-bold"
            style={{ color: tenant?.primary_color || "#00AF00" }}
          >
            Événements
          </h1>
          <p className="text-gray-600 mt-2">
            Découvrez tous les événements disponibles
          </p>
        </div>

        {user.role === "responsable" && (
          <Link href="/main/events/create">
            <Button primaryColor={tenant?.primary_color || "#00AF00"}>
              Créer un événement
            </Button>
          </Link>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Filtre par catégorie */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filtrer par catégorie
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="">Toutes les catégories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.nom}
            </option>
          ))}
        </select>
      </div>

      {filteredEvents.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-500">
              {selectedCategory
                ? "Aucun événement dans cette catégorie"
                : "Aucun événement disponible"}
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {event.nom}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    📅 {formatDate(event.date)}
                  </p>
                  <p className="text-sm text-gray-500">
                    📂 {getCategoryName(event.categorie_id)}
                  </p>
                  <p className="text-sm text-gray-500">
                    📊 Statut: {event.statut}
                  </p>
                </div>

                <div className="flex space-x-2">
                  <Link href={`/main/events/${event.id}`} className="flex-1">
                    <Button variant="secondary" size="sm" className="w-full">
                      Voir détails
                    </Button>
                  </Link>

                  {user.role === "responsable" && (
                    <>
                      <Link href={`/main/events/${event.id}/edit`}>
                        <Button variant="secondary" size="sm">
                          Modifier
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
