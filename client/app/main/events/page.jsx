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
  const [badges, setBadges] = useState([]);
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

      // MOCK DATA pour les badges
      const mockBadges = [
        {
          id: 1,
          nom: "Bénévole expérimenté",
          couleur: "#10B981",
          icone: "🏆",
        },
        {
          id: 2,
          nom: "Responsable cuisine",
          couleur: "#F59E0B",
          icone: "👨‍🍳",
        },
        {
          id: 3,
          nom: "Nouveau membre",
          couleur: "#8B5CF6",
          icone: "🌟",
        },
      ];
      setBadges(mockBadges);
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

  const getBadgeById = (badgeId) => {
    return badges.find((badge) => badge.id === badgeId);
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
                    <p className="text-sm text-gray-600 mb-1">
                      🕐 Début: {formatDate(event.date_formatted || event.date)}
                    </p>
                    {(event.date_fin_formatted || event.date_fin) && (
                      <p className="text-sm text-gray-600 mb-2">
                        🕑 Fin:{" "}
                        {formatDate(event.date_fin_formatted || event.date_fin)}
                      </p>
                    )}
                    <p className="text-sm text-gray-500">
                      📂 {getCategoryName(event.categorie_id)}
                    </p>
                    <p className="text-sm text-gray-500">
                      📊 Statut: {event.statut}
                    </p>

                    {/* Affichage des badges requis */}
                    {event.badges_requis && event.badges_requis.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-2">
                          Badges requis :
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {event.badges_requis.map((badgeId) => {
                            const badge = getBadgeById(badgeId);
                            if (!badge) return null;
                            return (
                              <div
                                key={badgeId}
                                className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white"
                                style={{ backgroundColor: badge.couleur }}
                                title={badge.nom}
                              >
                                <span>{badge.icone}</span>
                                <span>{badge.nom}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
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
                          <button
                            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors"
                            title="Modifier l'événement"
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
                        </Link>

                        <button
                          className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                          onClick={() => handleDeleteEvent(event.id)}
                          title="Supprimer l'événement"
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
