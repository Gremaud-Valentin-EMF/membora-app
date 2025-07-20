"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import apiService from "../../../lib/api";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Input from "../../../components/ui/Input";
import Link from "next/link";

export default function EventsPage() {
  const { user, tenant } = useAuth();
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
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

      const filteredEvents = eventsData.filter(
        (event) => event.tenant_id === user.tenant_id
      );
      const filteredCategories = categoriesData.filter(
        (category) => category.tenant_id === user.tenant_id
      );

      setEvents(filteredEvents);
      setCategories(filteredCategories);
    } catch (err) {
      setError("Erreur lors du chargement des événements");
      console.error("Error loading events:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet événement ?")) {
      return;
    }

    try {
      await apiService.deleteEvent(eventId);
      await loadData(); // Recharger la liste
    } catch (err) {
      setError("Erreur lors de la suppression de l'événement");
      console.error("Error deleting event:", err);
    }
  };

  const formatDate = (dateString) => {
    // Utiliser date_formatted si disponible, sinon dateString
    const dateToFormat = dateString || dateString;
    const date = new Date(dateToFormat);
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

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.nom
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      !selectedCategory || event.categorie_id == selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
      <Card>
        <div className="text-center mb-8">
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: tenant?.primary_color || "#00AF00" }}
          >
            Événements
          </h1>
          <p className="text-gray-600">
            Consultez et gérez les événements de votre organisation
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Filtres et recherche */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <Input
            type="text"
            placeholder="Rechercher un événement..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Toutes les catégories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.nom}
              </option>
            ))}
          </select>

          {(user.role === "responsable" || user.role === "sous-admin") && (
            <Link href="/main/events/create">
              <Button primaryColor={tenant?.primary_color || "#00AF00"}>
                Créer un événement
              </Button>
            </Link>
          )}
        </div>

        {/* Liste des événements */}
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
              <Card
                key={event.id}
                className="hover:shadow-lg transition-shadow"
              >
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {event.nom}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      📅 {formatDate(event.date_formatted || event.date)}
                    </p>
                    <p className="text-sm text-gray-500">
                      📂 {getCategoryName(event.categorie_id)}
                    </p>
                    <p className="text-sm text-gray-500">
                      📊 Statut: {event.statut}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link href={`/main/events/${event.id}`}>
                      <Button
                        size="sm"
                        primaryColor={tenant?.primary_color || "#00AF00"}
                      >
                        Voir détails
                      </Button>
                    </Link>

                    {(user.role === "responsable" ||
                      user.role === "sous-admin") && (
                      <>
                        <Link href={`/main/events/${event.id}/edit`}>
                          <Button variant="secondary" size="sm">
                            Modifier
                          </Button>
                        </Link>

                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleDeleteEvent(event.id)}
                        >
                          Supprimer
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
