"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "../../../contexts/AuthContext";
import apiService from "../../../lib/api";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Link from "next/link";

export default function AttendancePage() {
  const { user, tenant } = useAuth();
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId");

  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [members, setMembers] = useState([]);
  const [tranches, setTranches] = useState([]);
  const [inscriptions, setInscriptions] = useState([]);
  const [selectedTranche, setSelectedTranche] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      loadEventData(selectedEvent.id);
    }
  }, [selectedEvent]);

  useEffect(() => {
    if (selectedTranche) {
      apiService.getInscriptionsByTranche(selectedTranche.id).then(setInscriptions);
    }
  }, [selectedTranche]);

  const loadData = async () => {
    try {
      setLoading(true);
      const eventsData = await apiService.getEvents();
      const filteredEvents = eventsData.filter(
        (event) => event.tenant_id === user.tenant_id
      );
      setEvents(filteredEvents);

      // Si un eventId est spécifié dans l'URL, le sélectionner automatiquement
      if (eventId) {
        const event = filteredEvents.find((e) => e.id === parseInt(eventId));
        if (event) {
          setSelectedEvent(event);
        }
      }
    } catch (err) {
      setError("Erreur lors du chargement des événements");
      console.error("Error loading events:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadEventData = async (eventId) => {
    try {
      const [membersData, tranchesData] = await Promise.all([
        apiService.getMembers(),
        apiService.getTranchesByEvent(eventId),
      ]);

      const filteredMembers = membersData.filter(
        (member) => member.tenant_id === user.tenant_id
      );
      setMembers(filteredMembers);
      setTranches(tranchesData);
      if (tranchesData.length > 0) {
        setSelectedTranche(tranchesData[0]);
        const insc = await apiService.getInscriptionsByTranche(tranchesData[0].id);
        setInscriptions(insc);
      }
    } catch (err) {
      setError("Erreur lors du chargement des données de l'événement");
      console.error("Error loading event data:", err);
    }
  };

  const handleToggleInscription = async (memberId, inscrit) => {
    try {
      setSaving(true);
      if (inscrit) {
        const existing = inscriptions.find((i) => i.membre_id === memberId);
        if (existing) await apiService.deleteInscription(existing.id);
      } else {
        await apiService.createInscription({ tranche_id: selectedTranche.id, membre_id: memberId });
      }
      const updated = await apiService.getInscriptionsByTranche(selectedTranche.id);
      setInscriptions(updated);
    } catch (err) {
      setError("Erreur lors de la mise à jour de l'inscription");
    } finally {
      setSaving(false);
    }
  };

  const getParticipationStatus = (memberId) => {
    const ins = inscriptions.find((p) => p.membre_id === memberId);
    return ins ? true : false;
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
          Marquer les présences
        </h1>
        <p className="text-gray-600 mt-2">
          Sélectionnez un événement et marquez les présences des membres
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Sélection d'événement */}
      <Card className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          Sélectionner un événement
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <div
              key={event.id}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedEvent?.id === event.id
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setSelectedEvent(event)}
            >
              <h3 className="font-semibold text-gray-900">{event.nom}</h3>
              <p className="text-sm text-gray-600">{formatDate(event.date)}</p>
              <p className="text-sm text-gray-500">Statut: {event.statut}</p>
            </div>
          ))}
        </div>
      </Card>

      {selectedEvent && tranches.length > 0 && (
        <Card className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Sélectionner une tranche</h2>
          <div className="flex flex-wrap gap-2">
            {tranches.map((t) => (
              <Button
                key={t.id}
                size="sm"
                variant={selectedTranche?.id === t.id ? "primary" : "secondary"}
                primaryColor={tenant?.primary_color || "#00AF00"}
                onClick={() => setSelectedTranche(t)}
              >
                {new Date(t.debut).toLocaleString()}
              </Button>
            ))}
          </div>
        </Card>
      )}

      {/* Liste des membres et présences */}
      {selectedEvent && (
        <Card>
          <h2 className="text-xl font-semibold mb-4">
            Présences - {selectedEvent.nom}
          </h2>

          {members.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Aucun membre disponible pour cet événement
            </p>
          ) : (
            <div className="space-y-4">
              {members.map((member) => {
                const status = getParticipationStatus(member.id);
                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {member.nom}
                      </h3>
                      <p className="text-sm text-gray-600">{member.email}</p>
                      <p className="text-sm text-gray-500">
                        Rôle: {member.role}
                      </p>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        primaryColor={tenant?.primary_color || "#00AF00"}
                        onClick={() => handleToggleInscription(member.id, !!status)}
                        disabled={saving}
                      >
                        {status ? "Désinscrire" : "Inscrire"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
