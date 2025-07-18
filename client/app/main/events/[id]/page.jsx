"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../../../contexts/AuthContext";
import apiService from "../../../../lib/api";
import Button from "../../../../components/ui/Button";
import Card from "../../../../components/ui/Card";
import Link from "next/link";

export default function EventDetailPage() {
  const { id } = useParams();
  const { user, tenant } = useAuth();
  const router = useRouter();

  const [event, setEvent] = useState(null);
  const [category, setCategory] = useState(null);
  const [participations, setParticipations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadEventData();
  }, [id]);

  const loadEventData = async () => {
    try {
      setLoading(true);
      const [eventData, participationsData] = await Promise.all([
        apiService.getEvent(id),
        apiService.getParticipationsByEvent(id),
      ]);

      setEvent(eventData);
      setParticipations(participationsData);

      // Charger les informations de la catégorie
      if (eventData.categorie_id) {
        const categoryData = await apiService.getCategory(
          eventData.categorie_id
        );
        setCategory(categoryData);
      }
    } catch (err) {
      setError("Erreur lors du chargement de l'événement");
      console.error("Error loading event:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet événement ?")) {
      return;
    }

    try {
      await apiService.deleteEvent(id);
      router.push("/main/dashboard");
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
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getAttendanceStats = () => {
    const total = participations.length;
    const present = participations.filter((p) => p.present).length;
    const absent = participations.filter((p) => !p.present).length;
    return { total, present, absent };
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
          <Link href="/main/dashboard">
            <Button primaryColor={tenant?.primary_color || "#00AF00"}>
              Retour au dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const stats = getAttendanceStats();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link
          href="/main/events"
          className="text-green-600 hover:text-green-500 mb-4 inline-block"
        >
          ← Retour aux événements
        </Link>
        <h1
          className="text-3xl font-bold"
          style={{ color: tenant?.primary_color || "#00AF00" }}
        >
          {event.nom}
        </h1>
        <p className="text-gray-600 mt-2">Détails de l'événement</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Informations de l'événement */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">Informations</h2>
          <div className="space-y-3">
            <div>
              <span className="font-medium text-gray-700">Date :</span>
              <p className="text-gray-900">{formatDate(event.date)}</p>
            </div>

            {category && (
              <div>
                <span className="font-medium text-gray-700">Catégorie :</span>
                <p className="text-gray-900">{category.nom}</p>
              </div>
            )}

            <div>
              <span className="font-medium text-gray-700">Statut :</span>
              <span
                className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                  event.statut === "planifié"
                    ? "bg-blue-100 text-blue-800"
                    : event.statut === "en cours"
                    ? "bg-yellow-100 text-yellow-800"
                    : event.statut === "terminé"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {event.statut}
              </span>
            </div>
          </div>
        </Card>

        {/* Statistiques de présence */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">
            Statistiques de présence
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {stats.total}
                </div>
                <div className="text-sm text-blue-600">Total</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {stats.present}
                </div>
                <div className="text-sm text-green-600">Présents</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {stats.absent}
                </div>
                <div className="text-sm text-red-600">Absents</div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Actions */}
      <Card className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link href={`/main/attendance?eventId=${event.id}`}>
            <Button primaryColor={tenant?.primary_color || "#00AF00"}>
              Marquer les présences
            </Button>
          </Link>

          {user.role === "responsable" && (
            <>
              <Link href={`/main/events/${event.id}/edit`}>
                <Button variant="secondary">Modifier l'événement</Button>
              </Link>

              <Button variant="secondary" onClick={handleDeleteEvent}>
                Supprimer l'événement
              </Button>
            </>
          )}
        </div>
      </Card>

      {/* Liste des participations */}
      {participations.length > 0 && (
        <Card className="mt-6">
          <h2 className="text-xl font-semibold mb-4">
            Liste des participations
          </h2>
          <div className="space-y-3">
            {participations.map((participation) => (
              <div
                key={participation.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    Membre ID: {participation.membre_id}
                  </p>
                  <p className="text-sm text-gray-600">
                    Statut: {participation.present ? "Présent" : "Absent"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
