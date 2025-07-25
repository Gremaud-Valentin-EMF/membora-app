"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import apiService from "../../../lib/api";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Link from "next/link";

export default function DashboardPage() {
  const { user, tenant } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const viewMode = searchParams.get("view");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userStats, setUserStats] = useState({
    totalEvents: 0,
    totalHours: 0,
    currentInscriptions: 0,
    badgesObtenus: 0,
  });
  const [mesInscriptions, setMesInscriptions] = useState([]);
  const [evenementsAvenir, setEvenementsAvenir] = useState([]);
  const [mesBadges, setMesBadges] = useState([]);

  // États spécifiques pour les responsables
  const [responsableStats, setResponsableStats] = useState({
    evenementsResponsable: 0,
    tranchesAVenir: 0,
    membresEquipe: 0,
  });
  const [evenementsResponsable, setEvenementsResponsable] = useState([]);
  const [tranchesAVenir, setTranchesAVenir] = useState([]);
  const [membresEquipe, setMembresEquipe] = useState([]);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Si view=member, charger les données personnelles pour tous les rôles
      if (viewMode === "member" || user.role === "membre") {
        // MOCK DATA pour démonstration - MEMBRE
        const mockStats = {
          totalEvents: 12,
          totalHours: 48,
          currentInscriptions: 3,
          badgesObtenus: 2,
        };
        setUserStats(mockStats);

        // MOCK DATA pour les inscriptions actuelles
        const mockInscriptions = [
          {
            id: 1,
            event_id: 1,
            event_nom: "Soirée de Noël",
            tranche_id: 1,
            tranche_nom: "Service du soir",
            date_debut: new Date(
              Date.now() + 2 * 24 * 60 * 60 * 1000
            ).toISOString(),
            date_fin: new Date(
              Date.now() + 2 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000
            ).toISOString(),
            secteur_nom: "Service",
            couleur: "#3B82F6",
          },
          {
            id: 2,
            event_id: 2,
            event_nom: "Mariage Martin",
            tranche_id: 3,
            tranche_nom: "Préparation cuisine",
            date_debut: new Date(
              Date.now() + 5 * 24 * 60 * 60 * 1000
            ).toISOString(),
            date_fin: new Date(
              Date.now() + 5 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000
            ).toISOString(),
            secteur_nom: "Cuisine",
            couleur: "#10B981",
          },
        ];
        setMesInscriptions(mockInscriptions);

        // MOCK DATA pour les événements à venir
        const mockEvenements = [
          {
            id: 4,
            nom: "Fête de la musique",
            date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
            date_fin: new Date(
              Date.now() + 10 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000
            ).toISOString(),
            categorie_nom: "Festival",
            tranches_disponibles: 5,
            couleur: "#8B5CF6",
          },
        ];
        setEvenementsAvenir(mockEvenements);

        // MOCK DATA pour les badges
        const mockBadges = [
          {
            id: 1,
            nom: "Bénévole expérimenté",
            couleur: "#10B981",
            icone: "🏆",
            obtenu_le: new Date(
              Date.now() - 30 * 24 * 60 * 60 * 1000
            ).toISOString(),
          },
        ];
        setMesBadges(mockBadges);
      } else if (user.role === "responsable") {
        // MOCK DATA pour démonstration - RESPONSABLE
        const mockResponsableStats = {
          evenementsResponsable: 4,
          tranchesAVenir: 8,
          membresEquipe: 12,
        };
        setResponsableStats(mockResponsableStats);

        // MOCK DATA pour les événements dont ils sont responsables
        const mockEvenementsResponsable = [
          {
            id: 1,
            nom: "Soirée de Noël",
            date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            date_fin: new Date(
              Date.now() + 2 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000
            ).toISOString(),
            statut: "planifié",
            tranches_total: 6,
            tranches_completes: 4,
            couleur: "#3B82F6",
          },
          {
            id: 2,
            nom: "Mariage Martin",
            date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
            date_fin: new Date(
              Date.now() + 5 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000
            ).toISOString(),
            statut: "planifié",
            tranches_total: 8,
            tranches_completes: 6,
            couleur: "#10B981",
          },
          {
            id: 3,
            nom: "Festival d'été",
            date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
            date_fin: new Date(
              Date.now() + 15 * 24 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000
            ).toISOString(),
            statut: "planifié",
            tranches_total: 12,
            tranches_completes: 8,
            couleur: "#F59E0B",
          },
        ];
        setEvenementsResponsable(mockEvenementsResponsable);

        // MOCK DATA pour les tranches à venir
        const mockTranchesAVenir = [
          {
            id: 1,
            nom: "Service du soir",
            event_nom: "Soirée de Noël",
            date_debut: new Date(
              Date.now() + 2 * 24 * 60 * 60 * 1000
            ).toISOString(),
            participants_inscrits: 2,
            participants_necessaires: 4,
            secteur: "Service",
            couleur: "#3B82F6",
          },
          {
            id: 2,
            nom: "Préparation cuisine",
            event_nom: "Mariage Martin",
            date_debut: new Date(
              Date.now() + 5 * 24 * 60 * 60 * 1000
            ).toISOString(),
            participants_inscrits: 1,
            participants_necessaires: 3,
            secteur: "Cuisine",
            couleur: "#10B981",
          },
          {
            id: 3,
            nom: "Bar de nuit",
            event_nom: "Festival d'été",
            date_debut: new Date(
              Date.now() + 15 * 24 * 60 * 60 * 1000
            ).toISOString(),
            participants_inscrits: 0,
            participants_necessaires: 2,
            secteur: "Bar",
            couleur: "#F59E0B",
          },
        ];
        setTranchesAVenir(mockTranchesAVenir);

        // MOCK DATA pour les membres de l'équipe
        const mockMembresEquipe = [
          {
            id: 1,
            nom: "Jean Dupont",
            email: "jean@example.com",
            evenements_participes: 8,
            heures_total: 32,
            derniere_participation: new Date(
              Date.now() - 7 * 24 * 60 * 60 * 1000
            ).toISOString(),
          },
          {
            id: 2,
            nom: "Marie Martin",
            email: "marie@example.com",
            evenements_participes: 12,
            heures_total: 48,
            derniere_participation: new Date(
              Date.now() - 2 * 24 * 60 * 60 * 1000
            ).toISOString(),
          },
          {
            id: 3,
            nom: "Pierre Durand",
            email: "pierre@example.com",
            evenements_participes: 5,
            heures_total: 20,
            derniere_participation: new Date(
              Date.now() - 14 * 24 * 60 * 60 * 1000
            ).toISOString(),
          },
        ];
        setMembresEquipe(mockMembresEquipe);
      } else if (user.role === "sous-admin") {
        // MOCK DATA pour démonstration - SOUS-ADMIN
        const mockStats = {
          events: 15,
          membres: 45,
          badges: 8,
          categories: 6,
          articles: 12,
          tranchesAVenir: 25,
        };
        setUserStats(mockStats);
      }
    } catch (err) {
      setError("Erreur lors du chargement du dashboard");
      console.error("Error loading dashboard:", err);
    } finally {
      setLoading(false);
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

  const formatRelativeDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return "Demain";
    if (diffDays < 0) return "Passé";
    return `Dans ${diffDays} jours`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <div className="text-center py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Accès non autorisé
            </h1>
            <p className="text-gray-600">
              Veuillez vous connecter pour accéder au dashboard.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // Dashboard pour les MEMBRES ou vue personnelle
  if (user.role === "membre" || viewMode === "member") {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* En-tête du dashboard */}
        <div className="mb-8">
          <h1
            className="text-3xl font-bold"
            style={{ color: tenant?.primary_color || "#00AF00" }}
          >
            Mon Espace
          </h1>
          <p className="text-gray-600 mt-2">
            Bienvenue {user?.nom || user?.email}, voici un aperçu de vos
            activités
          </p>
        </div>

        {/* Statistiques principales */}
        <div className="grid gap-6 mb-8 lg:grid-cols-4">
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {userStats.totalEvents}
              </div>
              <div className="text-sm text-gray-600">Événements participés</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {userStats.totalHours}h
              </div>
              <div className="text-sm text-gray-600">Heures de bénévolat</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {userStats.currentInscriptions}
              </div>
              <div className="text-sm text-gray-600">Inscriptions actives</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {userStats.badgesObtenus}
              </div>
              <div className="text-sm text-gray-600">Badges obtenus</div>
            </div>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Mes inscriptions actuelles */}
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                Mes inscriptions actuelles
              </h2>
              <Link href="/main/events">
                <Button
                  primaryColor={tenant?.primary_color || "#00AF00"}
                  size="sm"
                >
                  Voir tous les événements
                </Button>
              </Link>
            </div>

            {mesInscriptions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-4">📅</div>
                <p className="text-lg font-medium mb-2">
                  Aucune inscription actuelle
                </p>
                <p className="text-sm text-gray-400 mb-4">
                  Vous n'êtes inscrit à aucune tranche horaire pour le moment.
                </p>
                <Link href="/main/events">
                  <Button
                    primaryColor={tenant?.primary_color || "#00AF00"}
                    size="sm"
                  >
                    Parcourir les événements
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {mesInscriptions.map((inscription) => (
                  <div
                    key={inscription.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: inscription.couleur }}
                          ></div>
                          <h3 className="font-medium text-gray-900">
                            {inscription.event_nom}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          {inscription.tranche_nom} • {inscription.secteur_nom}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(inscription.date_debut)} →{" "}
                          {formatDate(inscription.date_fin)}
                        </p>
                        <p className="text-xs text-blue-600 font-medium mt-1">
                          {formatRelativeDate(inscription.date_debut)}
                        </p>
                      </div>
                      <Link href={`/main/events/${inscription.event_id}`}>
                        <button className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors">
                          Voir détails
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Événements à venir */}
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Événements à venir</h2>
              <Link href="/main/events">
                <Button
                  primaryColor={tenant?.primary_color || "#00AF00"}
                  size="sm"
                >
                  Voir tous les événements
                </Button>
              </Link>
            </div>

            {evenementsAvenir.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-4">🎉</div>
                <p className="text-lg font-medium mb-2">
                  Aucun événement à venir
                </p>
                <p className="text-sm text-gray-400">
                  Aucun nouvel événement n'est prévu pour le moment.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {evenementsAvenir.map((event) => (
                  <div
                    key={event.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: event.couleur }}
                          ></div>
                          <h3 className="font-medium text-gray-900">
                            {event.nom}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          {event.categorie_nom}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(event.date)} →{" "}
                          {formatDate(event.date_fin)}
                        </p>
                        <p className="text-xs text-green-600 font-medium mt-1">
                          {event.tranches_disponibles} tranches disponibles
                        </p>
                      </div>
                      <Link href={`/main/events/${event.id}`}>
                        <button className="px-3 py-1 text-sm bg-green-100 hover:bg-green-200 text-green-600 rounded-lg transition-colors">
                          S'inscrire
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Mes badges */}
        <Card className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Mes badges</h2>

          {mesBadges.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-4">🏅</div>
              <p className="text-lg font-medium mb-2">Aucun badge obtenu</p>
              <p className="text-sm text-gray-400">
                Participez à des événements pour gagner vos premiers badges !
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {mesBadges.map((badge) => (
                <div
                  key={badge.id}
                  className="border border-gray-200 rounded-lg p-4 text-center hover:shadow-sm transition-shadow"
                >
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-2xl mx-auto mb-3"
                    style={{ backgroundColor: badge.couleur }}
                  >
                    {badge.icone}
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">
                    {badge.nom}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Obtenu le {formatDate(badge.obtenu_le)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Actions rapides */}
        <Card className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Actions rapides</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/main/events">
              <button className="w-full p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow text-center">
                <div className="text-2xl mb-2">📅</div>
                <div className="font-medium text-gray-900">
                  Voir les événements
                </div>
                <div className="text-sm text-gray-500">
                  Parcourir et s'inscrire
                </div>
              </button>
            </Link>

            <Link href="/main/profile">
              <button className="w-full p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow text-center">
                <div className="text-2xl mb-2">👤</div>
                <div className="font-medium text-gray-900">Mon profil</div>
                <div className="text-sm text-gray-500">
                  Gérer mes informations
                </div>
              </button>
            </Link>

            <button className="w-full p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow text-center">
              <div className="text-2xl mb-2">📊</div>
              <div className="font-medium text-gray-900">Mes statistiques</div>
              <div className="text-sm text-gray-500">Voir mon activité</div>
            </button>

            <button className="w-full p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow text-center">
              <div className="text-2xl mb-2">🔔</div>
              <div className="font-medium text-gray-900">Notifications</div>
              <div className="text-sm text-gray-500">Gérer mes alertes</div>
            </button>
          </div>
        </Card>
      </div>
    );
  }

  // Dashboard pour les RESPONSABLES
  if (user.role === "responsable") {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* En-tête du dashboard */}
        <div className="mb-8">
          <h1
            className="text-3xl font-bold"
            style={{ color: tenant?.primary_color || "#00AF00" }}
          >
            Dashboard Responsable
          </h1>
          <p className="text-gray-600 mt-2">
            Bienvenue {user?.nom || user?.email}, voici un aperçu de vos
            responsabilités
          </p>
        </div>

        {/* Statistiques principales */}
        <div className="grid gap-6 mb-8 lg:grid-cols-3">
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {responsableStats.evenementsResponsable}
              </div>
              <div className="text-sm text-gray-600">Événements à gérer</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {responsableStats.tranchesAVenir}
              </div>
              <div className="text-sm text-gray-600">Tranches à venir</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {responsableStats.membresEquipe}
              </div>
              <div className="text-sm text-gray-600">Membres d'équipe</div>
            </div>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Événements dont je suis responsable */}
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Mes événements</h2>
              <Link href="/main/events">
                <Button
                  primaryColor={tenant?.primary_color || "#00AF00"}
                  size="sm"
                >
                  Voir tous les événements
                </Button>
              </Link>
            </div>

            {evenementsResponsable.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-4">📋</div>
                <p className="text-lg font-medium mb-2">
                  Aucun événement à gérer
                </p>
                <p className="text-sm text-gray-400">
                  Vous n'êtes responsable d'aucun événement pour le moment.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {evenementsResponsable.map((event) => (
                  <div
                    key={event.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: event.couleur }}
                          ></div>
                          <h3 className="font-medium text-gray-900">
                            {event.nom}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-500">
                          {formatDate(event.date)} →{" "}
                          {formatDate(event.date_fin)}
                        </p>
                        <p className="text-xs text-blue-600 font-medium mt-1">
                          {formatRelativeDate(event.date)}
                        </p>
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Tranches :</span>
                            <span className="font-medium">
                              {event.tranches_completes}/{event.tranches_total}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{
                                width: `${
                                  (event.tranches_completes /
                                    event.tranches_total) *
                                  100
                                }%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      <Link href={`/main/events/${event.id}`}>
                        <button className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors">
                          Gérer
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Tranches à venir */}
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Tranches à venir</h2>
              <Link href="/main/events">
                <Button
                  primaryColor={tenant?.primary_color || "#00AF00"}
                  size="sm"
                >
                  Voir toutes les tranches
                </Button>
              </Link>
            </div>

            {tranchesAVenir.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-4">⏰</div>
                <p className="text-lg font-medium mb-2">
                  Aucune tranche à venir
                </p>
                <p className="text-sm text-gray-400">
                  Toutes les tranches sont complètes ou terminées.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {tranchesAVenir.map((tranche) => (
                  <div
                    key={tranche.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: tranche.couleur }}
                          ></div>
                          <h3 className="font-medium text-gray-900">
                            {tranche.nom}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          {tranche.event_nom} • {tranche.secteur}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(tranche.date_debut)}
                        </p>
                        <p className="text-xs text-blue-600 font-medium mt-1">
                          {formatRelativeDate(tranche.date_debut)}
                        </p>
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">
                              Participants :
                            </span>
                            <span
                              className={`font-medium ${
                                tranche.participants_inscrits >=
                                tranche.participants_necessaires
                                  ? "text-green-600"
                                  : tranche.participants_inscrits === 0
                                  ? "text-red-600"
                                  : "text-orange-600"
                              }`}
                            >
                              {tranche.participants_inscrits}/
                              {tranche.participants_necessaires}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Link href={`/main/events/${tranche.id}`}>
                        <button className="px-3 py-1 text-sm bg-orange-100 hover:bg-orange-200 text-orange-600 rounded-lg transition-colors">
                          Voir détails
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Membres de mon équipe */}
        <Card className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Mon équipe</h2>

          {membresEquipe.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-4">👥</div>
              <p className="text-lg font-medium mb-2">
                Aucun membre dans votre équipe
              </p>
              <p className="text-sm text-gray-400">
                Les membres seront ajoutés automatiquement à votre équipe.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {membresEquipe.map((membre) => (
                <div
                  key={membre.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {membre.nom}
                      </h3>
                      <p className="text-sm text-gray-600">{membre.email}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span>
                          📅 {membre.evenements_participes} événements
                        </span>
                        <span>⏰ {membre.heures_total}h total</span>
                        <span>
                          🕐 Dernière participation :{" "}
                          {formatRelativeDate(membre.derniere_participation)}
                        </span>
                      </div>
                    </div>
                    <Link href={`/main/members/${membre.id}`}>
                      <button className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors">
                        Voir profil
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Actions rapides */}
        <Card className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Actions rapides</h2>
          <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-3">
            <Link href="/main/events">
              <button className="w-full p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow text-center">
                <div className="text-2xl mb-2">📅</div>
                <div className="font-medium text-gray-900">
                  Gérer les événements
                </div>
                <div className="text-sm text-gray-500">Voir et organiser</div>
              </button>
            </Link>

            <button className="w-full p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow text-center">
              <div className="text-2xl mb-2">📊</div>
              <div className="font-medium text-gray-900">Rapports</div>
              <div className="text-sm text-gray-500">Voir les statistiques</div>
            </button>

            <button className="w-full p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow text-center">
              <div className="text-2xl mb-2">🔔</div>
              <div className="font-medium text-gray-900">Notifications</div>
              <div className="text-sm text-gray-500">Gérer les alertes</div>
            </button>
          </div>
        </Card>
      </div>
    );
  }

  // Dashboard pour les SOUS-ADMIN (code existant)
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* En-tête */}
      <div className="mb-8">
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: tenant?.primary_color || "#00AF00" }}
        >
          Dashboard Sous-Admin
        </h1>
        <p className="text-gray-600">
          Vue d'ensemble de la gestion de {tenant?.nom || "votre organisation"}
        </p>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <Card className="text-center">
          <div className="text-2xl font-bold text-blue-600 mb-1">
            {userStats.events}
          </div>
          <div className="text-sm text-gray-600">Événements</div>
          <Link href="/main/events">
            <Button size="sm" variant="secondary" className="mt-2 w-full">
              Voir tout
            </Button>
          </Link>
        </Card>

        <Card className="text-center">
          <div className="text-2xl font-bold text-green-600 mb-1">
            {userStats.membres}
          </div>
          <div className="text-sm text-gray-600">Membres</div>
          <Link href="/main/members">
            <Button size="sm" variant="secondary" className="mt-2 w-full">
              Gérer
            </Button>
          </Link>
        </Card>

        <Card className="text-center">
          <div className="text-2xl font-bold text-purple-600 mb-1">
            {userStats.badges}
          </div>
          <div className="text-sm text-gray-600">Badges</div>
          <Link href="/main/badges">
            <Button size="sm" variant="secondary" className="mt-2 w-full">
              Gérer
            </Button>
          </Link>
        </Card>

        <Card className="text-center">
          <div className="text-2xl font-bold text-orange-600 mb-1">
            {userStats.categories}
          </div>
          <div className="text-sm text-gray-600">Catégories</div>
          <Link href="/main/categories">
            <Button size="sm" variant="secondary" className="mt-2 w-full">
              Gérer
            </Button>
          </Link>
        </Card>

        <Card className="text-center">
          <div className="text-2xl font-bold text-indigo-600 mb-1">
            {userStats.articles}
          </div>
          <div className="text-sm text-gray-600">Articles</div>
          <Link href="/main/articles">
            <Button size="sm" variant="secondary" className="mt-2 w-full">
              Gérer
            </Button>
          </Link>
        </Card>

        <Card className="text-center">
          <div className="text-2xl font-bold text-red-600 mb-1">
            {userStats.tranchesAVenir}
          </div>
          <div className="text-sm text-gray-600">Tranches à venir</div>
        </Card>
      </div>

      {/* Actions rapides */}
      <Card className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Actions rapides</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/main/events/create">
            <Button
              primaryColor={tenant?.primary_color || "#00AF00"}
              className="w-full"
            >
              ➕ Créer événement
            </Button>
          </Link>

          <Link href="/main/badges">
            <Button variant="secondary" className="w-full">
              🏆 Gérer badges
            </Button>
          </Link>

          <Link href="/main/members">
            <Button variant="secondary" className="w-full">
              👥 Gérer membres
            </Button>
          </Link>

          <Link href="/main/articles/create">
            <Button variant="secondary" className="w-full">
              📄 Créer article
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
