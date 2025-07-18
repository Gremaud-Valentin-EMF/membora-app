"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import apiService from "../../../lib/api";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Link from "next/link";

export default function DashboardPage() {
  const { user, tenant } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const eventsData = await apiService.getEvents();
      // Filtrer les événements créés par l'utilisateur si c'est un responsable
      const userEvents =
        user.role === "responsable"
          ? eventsData.filter((event) => event.tenant_id === user.tenant_id)
          : eventsData;
      setEvents(userEvents);
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
      await loadEvents(); // Recharger la liste
    } catch (err) {
      setError("Erreur lors de la suppression de l'événement");
      console.error("Error deleting event:", err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card>
        <div className="text-center mb-8">
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: tenant?.primary_color || "#00AF00" }}
          >
            Dashboard Responsable
          </h1>
          <p className="text-gray-600">Mes événements créés</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {events.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">
              Aucun événement créé pour le moment
            </p>
            {user.role === "responsable" && (
              <Link href="/main/events/create">
                <Button primaryColor={tenant?.primary_color || "#00AF00"}>
                  Créer votre premier événement
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {events.map((event) => (
              <div
                key={event.id}
                className="border-b border-gray-200 pb-6 last:border-b-0"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {event.nom}
                    </h3>
                    <p className="text-gray-600">{formatDate(event.date)}</p>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Link href={`/main/attendance?eventId=${event.id}`}>
                    <Button
                      size="sm"
                      primaryColor={tenant?.primary_color || "#00AF00"}
                    >
                      Marquer les présences
                    </Button>
                  </Link>

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
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
