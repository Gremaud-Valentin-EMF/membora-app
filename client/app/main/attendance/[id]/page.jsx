"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import Link from "next/link";

// Données mockées
const mockEvent = {
  id: 1,
  name: "Tournoi de foot",
  date: "2025-06-20T14:00:00",
  location: "Stade municipal",
};

const mockParticipants = [
  {
    id: 1,
    name: "Jean Dupont",
    email: "jean.dupont@email.com",
    present: false,
  },
  {
    id: 2,
    name: "Marie Martin",
    email: "marie.martin@email.com",
    present: true,
  },
  {
    id: 3,
    name: "Pierre Durand",
    email: "pierre.durand@email.com",
    present: false,
  },
  {
    id: 4,
    name: "Sophie Bernard",
    email: "sophie.bernard@email.com",
    present: true,
  },
  {
    id: 5,
    name: "Lucas Petit",
    email: "lucas.petit@email.com",
    present: false,
  },
];

export default function AttendancePage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Simuler un appel API
    setTimeout(() => {
      setEvent(mockEvent);
      setParticipants(mockParticipants);
      setLoading(false);
    }, 500);
  }, [params.id]);

  const handleTogglePresence = (participantId) => {
    setParticipants((prev) =>
      prev.map((p) =>
        p.id === participantId ? { ...p, present: !p.present } : p
      )
    );
  };

  const handleSaveAttendance = async () => {
    setSaving(true);
    try {
      // Ici on ferait un appel API pour sauvegarder les présences
      console.log("Sauvegarde des présences:", participants);

      // Simuler un délai
      await new Promise((resolve) => setTimeout(resolve, 1000));

      alert("Présences sauvegardées avec succès !");
    } catch (error) {
      alert("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredParticipants = participants.filter(
    (participant) =>
      participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      participant.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const presentCount = participants.filter((p) => p.present).length;
  const totalCount = participants.length;

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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500 mb-4">Événement non trouvé</p>
              <Link href="/dashboard">
                <Button>Retour au dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="text-green-600 hover:text-green-700"
          >
            ← Retour au dashboard
          </Link>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">
                  Marquer les présences
                </CardTitle>
                <CardDescription className="text-lg mt-2">
                  {event.name} - {formatDate(event.date)}
                </CardDescription>
                {event.location && (
                  <p className="text-sm text-gray-600 mt-1">
                    📍 {event.location}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Présents</p>
                <p className="text-2xl font-bold tenant-primary">
                  {presentCount}/{totalCount}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <Input
                type="text"
                placeholder="Rechercher un participant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>

            <div className="space-y-3 mb-6">
              {filteredParticipants.map((participant) => (
                <div
                  key={participant.id}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                    participant.present
                      ? "bg-green-50 border-green-200"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {participant.name}
                    </p>
                    <p className="text-sm text-gray-600">{participant.email}</p>
                  </div>
                  <Button
                    variant={participant.present ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleTogglePresence(participant.id)}
                    className={participant.present ? "tenant-primary-bg" : ""}
                  >
                    {participant.present ? "Présent" : "Absent"}
                  </Button>
                </div>
              ))}
            </div>

            {filteredParticipants.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  {searchTerm
                    ? "Aucun participant trouvé"
                    : "Aucun participant inscrit"}
                </p>
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                {presentCount} présent{presentCount > 1 ? "s" : ""} sur{" "}
                {totalCount} participant{totalCount > 1 ? "s" : ""}
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/events/${params.id}`)}
                >
                  Annuler
                </Button>
                <Button onClick={handleSaveAttendance} disabled={saving}>
                  {saving ? "Sauvegarde..." : "Sauvegarder les présences"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
