"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import apiService from "../../../lib/api";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Link from "next/link";
import Image from "next/image";

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
  }, [user, viewMode]); // Ajouter viewMode comme dépendance

  // Ajouter un refresh automatique quand la page reprend le focus
  useEffect(() => {
    const handleFocus = () => {
      if (user && !loading) {
        console.log(
          "Refresh automatique au focus - Dashboard:",
          user.role,
          "ViewMode:",
          viewMode
        );
        loadDashboardData();
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [user, loading, viewMode]); // Ajouter viewMode comme dépendance

  // Refresh automatique toutes les 30 secondes si la page est active
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      if (document.visibilityState === "visible" && !loading) {
        console.log(
          "Refresh automatique périodique - Dashboard:",
          user.role,
          "ViewMode:",
          viewMode
        );
        loadDashboardData();
      }
    }, 30000); // 30 secondes

    return () => clearInterval(interval);
  }, [user, loading, viewMode]); // Ajouter viewMode comme dépendance

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Charger les données selon le rôle et la vue
      if (user.role === "sous-admin" && viewMode !== "member") {
        // Dashboard sous-admin - charger toutes les stats
        const [events, members, badges, categories, articles, tranches] =
          await Promise.all([
            apiService.getEvents(),
            apiService.getMembers(),
            apiService.getBadges(),
            apiService.getCategories(),
            apiService.getArticles(),
            apiService.getTranches(),
          ]);
        setUserStats({
          events: events.length,
          membres: members.length,
          badges: badges.length,
          categories: categories.length,
          articles: articles.length,
          tranchesAVenir: tranches.filter((t) => new Date(t.debut) > new Date())
            .length,
        });
      } else {
        // Dashboard membre, responsable, ou "Mon Espace" (viewMode === "member") - charger les données personnelles
        const [inscriptions, badges, evenements] = await Promise.all([
          apiService.getMembreInscriptions(user.id),
          apiService.getMembreBadges(user.id), // Utiliser getMembreBadges au lieu de getBadges
          apiService.getEvents(),
        ]);

        setMesInscriptions(inscriptions);
        setMesBadges(badges);
        setEvenementsAvenir(evenements);

        // Calculer les stats personnelles
        setUserStats({
          totalEvents: inscriptions.length,
          totalHours: inscriptions.reduce(
            (acc, i) =>
              acc + (new Date(i.date_fin) - new Date(i.date_debut)) / 3600000,
            0
          ),
          currentInscriptions: inscriptions.length,
          badgesObtenus: badges.length,
        });

        // Charger les données spécifiques pour les responsables
        if (user.role === "responsable") {
          try {
            // Charger les membres pour l'équipe
            const membresData = await apiService.getMembers();

            // Charger les événements dont l'utilisateur est responsable
            const eventsResponsable = evenements.filter(
              (event) => event.responsable_id === user.id
            );
            setEvenementsResponsable(eventsResponsable);

            // Charger les tranches à venir
            const allTranches = await apiService.getTranches();
            const tranchesAVenir = allTranches.filter(
              (t) => new Date(t.debut) > new Date()
            );
            setTranchesAVenir(tranchesAVenir);

            // Charger les membres de l'équipe (pour l'instant, tous les membres)
            setMembresEquipe(membresData);

            // Mettre à jour les stats responsable
            setResponsableStats({
              evenementsResponsable: eventsResponsable.length,
              tranchesAVenir: tranchesAVenir.length,
              membresEquipe: membresData.length,
            });
          } catch (err) {
            console.error("Error loading responsable data:", err);
          }
        }
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600 mb-2">Chargement du dashboard...</p>
          <p className="text-sm text-gray-500">
            {user?.role === "sous-admin"
              ? "Récupération des statistiques globales..."
              : user?.role === "responsable"
              ? "Récupération de vos responsabilités..."
              : "Récupération de vos données personnelles..."}
          </p>
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
          <div>
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
                <Image
                  src="/icons/calendrier.svg"
                  alt="Aucune inscription"
                  width={48}
                  height={48}
                  className="mx-auto mb-4 opacity-50"
                />
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
                    Obtenu le{" "}
                    {badge.date_attribution
                      ? formatDate(badge.date_attribution)
                      : "Date non disponible"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Actions rapides */}
        <Card className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Actions rapides</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link href="/main/events">
              <button className="w-full p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow text-center">
                <Image
                  src="/icons/calendrier.svg"
                  alt="Voir les événements"
                  width={32}
                  height={32}
                  className="mx-auto mb-2"
                />
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
                <Image
                  src="/icons/profile.svg"
                  alt="Mon profil"
                  width={32}
                  height={32}
                  className="mx-auto mb-2"
                />
                <div className="font-medium text-gray-900">Mon profil</div>
                <div className="text-sm text-gray-500">
                  Gérer mes informations
                </div>
              </button>
            </Link>
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
          <div>
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
                <div className="mb-4">
                  <Image
                    src="/icons/calendrier.svg"
                    alt="Calendrier"
                    width={48}
                    height={48}
                    className="mx-auto"
                  />
                </div>
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
                <div className="mb-4">
                  <Image
                    src="/icons/horloge.svg"
                    alt="Horloge"
                    width={48}
                    height={48}
                    className="mx-auto"
                  />
                </div>
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
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Actions rapides */}
        <Card className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Actions rapides</h2>
          <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-1">
            <Link href="/main/events">
              <button className="w-full p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow text-center">
                <div className="mb-2">
                  <Image
                    src="/icons/calendrier.svg"
                    alt="Calendrier"
                    width={32}
                    height={32}
                    className="mx-auto"
                  />
                </div>
                <div className="font-medium text-gray-900">
                  Gérer les événements
                </div>
                <div className="text-sm text-gray-500">Voir et organiser</div>
              </button>
            </Link>
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
        <div>
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: tenant?.primary_color || "#00AF00" }}
          >
            Dashboard Sous-Admin
          </h1>
          <p className="text-gray-600">
            Vue d'ensemble de la gestion de{" "}
            {tenant?.nom || "votre organisation"}
          </p>
        </div>
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
              className="w-full flex flex-col items-center"
            >
              <Image
                src="/icons/calendrier.svg"
                alt="Créer événement"
                width={32}
                height={32}
                className="mb-2"
              />
              Créer événement
            </Button>
          </Link>

          <Link href="/main/badges">
            <Button
              variant="secondary"
              className="w-full flex flex-col items-center"
            >
              <Image
                src="/icons/badge.svg"
                alt="Gérer badges"
                width={32}
                height={32}
                className="mb-2"
              />
              Gérer badges
            </Button>
          </Link>

          <Link href="/main/members">
            <Button
              variant="secondary"
              className="w-full flex flex-col items-center"
            >
              <Image
                src="/icons/membre.svg"
                alt="Gérer membres"
                width={32}
                height={32}
                className="mb-2"
              />
              Gérer membres
            </Button>
          </Link>

          <Link href="/main/articles/create">
            <Button
              variant="secondary"
              className="w-full flex flex-col items-center"
            >
              <Image
                src="/icons/article.svg"
                alt="Créer article"
                width={32}
                height={32}
                className="mb-2"
              />
              Créer article
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
