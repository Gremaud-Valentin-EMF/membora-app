"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../../../../../contexts/AuthContext";
import apiService from "../../../../../../lib/api";
import Button from "../../../../../../components/ui/Button";
import Card from "../../../../../../components/ui/Card";
import Input from "../../../../../../components/ui/Input";
import Link from "next/link";

export default function TrancheInscriptionsPage() {
  const { id: eventId, trancheId } = useParams();
  const { user, tenant } = useAuth();
  const router = useRouter();

  const [event, setEvent] = useState(null);
  const [tranche, setTranche] = useState(null);
  const [membres, setMembres] = useState([]);
  const [membresInscrits, setMembresInscrits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadData();
  }, [eventId, trancheId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Charger l'événement
      const eventData = await apiService.getEvent(eventId);
      setEvent(eventData);

      // TODO: Charger la tranche horaire réelle
      // const trancheData = await apiService.getTrancheHoraire(trancheId);

      // MOCK DATA pour la tranche
      const mockTranche = {
        id: parseInt(trancheId),
        nom: "Service du matin",
        secteur_nom: "Service",
        date_debut: "2025-01-27T08:00:00",
        date_fin: "2025-01-27T12:00:00",
        participants_necessaires: 3,
        participants_inscrits: 1,
        couleur: "#3B82F6",
      };
      setTranche(mockTranche);

      // Charger tous les membres du tenant
      const membresData = await apiService.getMembers();
      const membresFiltered = membresData.filter(
        (m) => m.tenant_id === user.tenant_id
      );
      setMembres(membresFiltered);

      // TODO: Charger les membres déjà inscrits à cette tranche
      // const inscriptionsData = await apiService.getInscriptionsTrancheHoraire(trancheId);

      // MOCK DATA pour les inscriptions
      const mockInscriptions = [
        {
          id: 1,
          membre_id: membresFiltered[0]?.id,
          nom: membresFiltered[0]?.nom || "Jean Dupont",
          email: membresFiltered[0]?.email || "jean.dupont@example.com",
          role: membresFiltered[0]?.role || "membre",
        },
      ];
      setMembresInscrits(mockInscriptions);
    } catch (err) {
      setError("Erreur lors du chargement des données");
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Calculer les statistiques d'inscription pour chaque membre
  const getMemberStats = (membreId) => {
    // TODO: Récupérer les vraies données depuis l'API
    // const memberInscriptions = await apiService.getMemberInscriptionsForEvent(eventId, membreId);

    // MOCK DATA - Simuler des inscriptions existantes pour certains membres
    const mockInscriptions = {
      [membresInscrits[0]?.membre_id]: {
        tranches: 2, // Inscrit à 2 tranches au total
        heures: 7.5, // 7h30 au total
        details: [
          { nom: "Service du matin", heures: 4 },
          { nom: "Préparation cuisine", heures: 3.5 },
        ],
      },
    };

    // Simuler des données pour d'autres membres
    const memberStats = mockInscriptions[membreId] || {
      tranches: Math.floor(Math.random() * 4), // 0-3 tranches
      heures: Math.round((Math.random() * 12 + 1) * 2) / 2, // 1-12.5 heures par tranche de 0.5h
      details: [],
    };

    return memberStats;
  };

  const formatHeures = (heures) => {
    const h = Math.floor(heures);
    const m = (heures % 1) * 60;
    if (m === 0) {
      return `${h}h`;
    } else {
      return `${h}h${m.toString().padStart(2, "0")}`;
    }
  };

  const handleInscrireMembre = async (membre) => {
    try {
      // TODO: Implémenter l'inscription réelle
      // await apiService.inscrireMemberTrancheHoraire(trancheId, membre.id);

      console.log(
        "Inscription membre:",
        membre.nom,
        "à la tranche:",
        tranche.nom
      );

      // Ajouter à la liste des inscrits
      setMembresInscrits((prev) => [
        ...prev,
        {
          id: Date.now(), // ID temporaire
          membre_id: membre.id,
          nom: membre.nom,
          email: membre.email,
          role: membre.role,
        },
      ]);

      // Mettre à jour le compteur de la tranche
      setTranche((prev) => ({
        ...prev,
        participants_inscrits: prev.participants_inscrits + 1,
      }));
    } catch (err) {
      setError("Erreur lors de l'inscription du membre");
      console.error("Error inscribing member:", err);
    }
  };

  const handleDesinscrireMembre = async (inscription) => {
    try {
      // TODO: Implémenter la désinscription réelle
      // await apiService.desinscrireMemberTrancheHoraire(inscription.id);

      console.log(
        "Désinscription membre:",
        inscription.nom,
        "de la tranche:",
        tranche.nom
      );

      // Retirer de la liste des inscrits
      setMembresInscrits((prev) => prev.filter((i) => i.id !== inscription.id));

      // Mettre à jour le compteur de la tranche
      setTranche((prev) => ({
        ...prev,
        participants_inscrits: Math.max(0, prev.participants_inscrits - 1),
      }));
    } catch (err) {
      setError("Erreur lors de la désinscription du membre");
      console.error("Error unsubscribing member:", err);
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

  const membresDisponibles = membres.filter(
    (membre) =>
      !membresInscrits.some((inscrit) => inscrit.membre_id === membre.id) &&
      membre.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const membresInscritsFiltres = membresInscrits.filter((inscrit) =>
    inscrit.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  if (!event || !tranche) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Tranche horaire non trouvée
          </h1>
          <Link href={`/main/events/${eventId}`}>
            <Button primaryColor={tenant?.primary_color || "#00AF00"}>
              Retour à l'événement
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link
          href={`/main/events/${eventId}`}
          className="text-green-600 hover:text-green-500 mb-4 inline-block"
        >
          ← Retour à l'événement
        </Link>
        <h1
          className="text-3xl font-bold"
          style={{ color: tenant?.primary_color || "#00AF00" }}
        >
          Gestion des inscriptions
        </h1>
        <p className="text-gray-600 mt-2">
          {event.nom} - {tranche.nom}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Informations de la tranche */}
      <Card className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Informations de la tranche</h2>
          <div
            className="px-3 py-1 rounded-full text-white text-sm font-medium"
            style={{ backgroundColor: tranche.couleur }}
          >
            {tranche.secteur_nom}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <span className="font-medium text-gray-700">Nom :</span>
            <p className="text-gray-900">{tranche.nom}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Horaires :</span>
            <p className="text-gray-900">
              {formatDate(tranche.date_debut)} <br />→{" "}
              {formatDate(tranche.date_fin)}
            </p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Participants :</span>
            <p className="text-gray-900">
              <span
                className={`font-bold ${
                  tranche.participants_inscrits >=
                  tranche.participants_necessaires
                    ? "text-green-600"
                    : "text-orange-600"
                }`}
              >
                {tranche.participants_inscrits}
              </span>
              {" / "}
              <span className="text-gray-600">
                {tranche.participants_necessaires}
              </span>
              {" requis"}
            </p>
          </div>
        </div>
      </Card>

      {/* Barre de recherche */}
      <Card className="mb-6">
        <Input
          type="text"
          placeholder="Rechercher un membre par nom..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Membres disponibles */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">
            Membres disponibles ({membresDisponibles.length})
          </h2>

          {membresDisponibles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm
                ? "Aucun membre trouvé"
                : "Tous les membres sont déjà inscrits"}
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {membresDisponibles.map((membre) => {
                const stats = getMemberStats(membre.id);
                return (
                  <div
                    key={membre.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            {membre.nom}
                          </p>
                          <p className="text-sm text-gray-600">
                            {membre.email}
                          </p>
                          <p className="text-xs text-gray-500 capitalize">
                            {membre.role}
                          </p>
                        </div>
                        <div className="text-right ml-4">
                          <div className="flex gap-3 text-xs">
                            <div className="text-center">
                              <div
                                className={`font-bold ${
                                  stats.tranches > 0
                                    ? "text-blue-600"
                                    : "text-gray-400"
                                }`}
                              >
                                {stats.tranches}
                              </div>
                              <div className="text-gray-500">
                                tranche{stats.tranches !== 1 ? "s" : ""}
                              </div>
                            </div>
                            <div className="text-center">
                              <div
                                className={`font-bold ${
                                  stats.heures > 0
                                    ? "text-green-600"
                                    : "text-gray-400"
                                }`}
                              >
                                {formatHeures(stats.heures)}
                              </div>
                              <div className="text-gray-500">au total</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      primaryColor={tenant?.primary_color || "#00AF00"}
                      onClick={() => handleInscrireMembre(membre)}
                      disabled={
                        tranche.participants_inscrits >=
                        tranche.participants_necessaires
                      }
                      className="ml-3"
                    >
                      Inscrire
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Membres inscrits */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">
            Membres inscrits ({membresInscritsFiltres.length})
          </h2>

          {membresInscritsFiltres.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm
                ? "Aucun membre inscrit trouvé"
                : "Aucun membre inscrit"}
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {membresInscritsFiltres.map((inscription) => {
                const stats = getMemberStats(inscription.membre_id);
                return (
                  <div
                    key={inscription.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-green-50 border-green-200"
                  >
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            {inscription.nom}
                          </p>
                          <p className="text-sm text-gray-600">
                            {inscription.email}
                          </p>
                          <p className="text-xs text-gray-500 capitalize">
                            {inscription.role}
                          </p>
                        </div>
                        <div className="text-right ml-4">
                          <div className="flex gap-3 text-xs">
                            <div className="text-center">
                              <div className="font-bold text-blue-600">
                                {stats.tranches}
                              </div>
                              <div className="text-gray-500">
                                tranche{stats.tranches !== 1 ? "s" : ""}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="font-bold text-green-600">
                                {formatHeures(stats.heures)}
                              </div>
                              <div className="text-gray-500">au total</div>
                            </div>
                          </div>
                          {/* Détail des tranches si disponible */}
                          {stats.details.length > 0 && (
                            <div className="mt-2 text-xs text-gray-600">
                              {stats.details.map((detail, index) => (
                                <div key={index} className="truncate">
                                  {detail.nom}: {formatHeures(detail.heures)}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleDesinscrireMembre(inscription)}
                      className="ml-3"
                    >
                      Désinscrire
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Résumé et actions */}
      <Card className="mt-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-medium">Résumé</h3>
            <p className="text-gray-600">
              {tranche.participants_inscrits >=
              tranche.participants_necessaires ? (
                <span className="text-green-600 font-medium">
                  ✅ Tranche complète ({tranche.participants_inscrits}/
                  {tranche.participants_necessaires})
                </span>
              ) : (
                <span className="text-orange-600 font-medium">
                  ⚠️ Il manque{" "}
                  {tranche.participants_necessaires -
                    tranche.participants_inscrits}{" "}
                  participant(s)
                </span>
              )}
            </p>
          </div>

          <div className="flex gap-3">
            <Link href={`/main/events/${eventId}`}>
              <Button variant="secondary">Retour à l'événement</Button>
            </Link>
            <Button primaryColor={tenant?.primary_color || "#00AF00"}>
              Envoyer notifications
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
