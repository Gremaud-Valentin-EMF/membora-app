"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../../../contexts/AuthContext";
import apiService from "../../../../lib/api";
import Button from "../../../../components/ui/Button";
import Card from "../../../../components/ui/Card";
import Input from "../../../../components/ui/Input";
import Link from "next/link";

export default function EventDetailPage() {
  const { id } = useParams();
  const { user, tenant } = useAuth();
  const router = useRouter();

  const [event, setEvent] = useState(null);
  const [category, setCategory] = useState(null);
  const [badges, setBadges] = useState([]);
  const [participations, setParticipations] = useState([]);
  const [tranchesHoraires, setTranchesHoraires] = useState([]);
  const [secteurs, setSecteurs] = useState([]);
  const [userInscriptions, setUserInscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Refs pour synchroniser le scroll
  const datesHeaderRef = useRef(null);
  const hoursHeaderRef = useRef(null);
  const timelineContentRef = useRef(null);

  // État pour le formulaire de création de tranche horaire
  const [showTrancheForm, setShowTrancheForm] = useState(false);
  const [trancheFormData, setTrancheFormData] = useState({
    nom: "",
    secteur_id: "",
    date_debut: "",
    date_fin: "",
    participants_necessaires: 1,
  });

  useEffect(() => {
    loadEventData();
  }, [id]);

  // Fonction pour synchroniser le scroll depuis les en-têtes
  const handleHeaderScroll = (e) => {
    const scrollLeft = e.target.scrollLeft;

    // Synchroniser le contenu de la timeline
    if (timelineContentRef.current) {
      timelineContentRef.current.scrollLeft = scrollLeft;
    }

    // Synchroniser les autres en-têtes
    if (e.target === datesHeaderRef.current && hoursHeaderRef.current) {
      hoursHeaderRef.current.scrollLeft = scrollLeft;
    } else if (e.target === hoursHeaderRef.current && datesHeaderRef.current) {
      datesHeaderRef.current.scrollLeft = scrollLeft;
    }
  };

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

      // TODO: Charger les tranches horaires et secteurs
      // setTranchesHoraires(await apiService.getTranchesByEvent(id));
      // setSecteurs(await apiService.getSecteurs());

      // MOCK DATA pour démonstration
      const mockTranches = [
        {
          id: 1,
          nom: "Service du matin",
          secteur_id: 2,
          secteur_nom: "Service",
          date_debut: new Date(
            new Date(eventData.date).setHours(8, 0, 0, 0)
          ).toISOString(), // 8h00
          date_fin: new Date(
            new Date(eventData.date).setHours(12, 0, 0, 0)
          ).toISOString(), // 12h00
          participants_necessaires: 3,
          participants_inscrits: 1,
          couleur: "#3B82F6",
        },
        {
          id: 2,
          nom: "Préparation cuisine",
          secteur_id: 1,
          secteur_nom: "Cuisine",
          date_debut: new Date(
            new Date(eventData.date).setHours(6, 30, 0, 0)
          ).toISOString(), // 6h30
          date_fin: new Date(
            new Date(eventData.date).setHours(10, 30, 0, 0)
          ).toISOString(), // 10h30
          participants_necessaires: 2,
          participants_inscrits: 2,
          couleur: "#10B981",
        },
        {
          id: 3,
          nom: "Service du soir",
          secteur_id: 2,
          secteur_nom: "Service",
          date_debut: new Date(
            new Date(eventData.date).setHours(18, 0, 0, 0)
          ).toISOString(), // 18h00
          date_fin: new Date(
            new Date(eventData.date).setHours(22, 30, 0, 0)
          ).toISOString(), // 22h30
          participants_necessaires: 4,
          participants_inscrits: 3,
          couleur: "#F59E0B",
        },
      ];

      // Si l'événement dure plusieurs jours, ajouter des tranches pour le 2ème jour
      const eventStart = new Date(eventData.date);
      const eventEnd = new Date(eventData.date_fin);
      const isMultiDay =
        eventEnd.getDate() !== eventStart.getDate() ||
        eventEnd.getMonth() !== eventStart.getMonth() ||
        eventEnd.getFullYear() !== eventStart.getFullYear();

      if (isMultiDay) {
        const secondDay = new Date(eventStart);
        secondDay.setDate(secondDay.getDate() + 1);

        mockTranches.push(
          {
            id: 4,
            nom: "Nettoyage matinal",
            secteur_id: 4,
            secteur_nom: "Nettoyage",
            date_debut: new Date(secondDay.setHours(7, 0, 0, 0)).toISOString(),
            date_fin: new Date(secondDay.setHours(9, 0, 0, 0)).toISOString(),
            participants_necessaires: 2,
            participants_inscrits: 0,
            couleur: "#8B5CF6",
          },
          {
            id: 5,
            nom: "Bar de nuit",
            secteur_id: 3,
            secteur_nom: "Bar",
            date_debut: new Date(secondDay.setHours(20, 0, 0, 0)).toISOString(),
            date_fin: new Date(secondDay.setHours(23, 59, 0, 0)).toISOString(),
            participants_necessaires: 2,
            participants_inscrits: 1,
            couleur: "#EF4444",
          }
        );
      }

      setTranchesHoraires(mockTranches);
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

  const handleCancelEvent = async () => {
    const isCurrentlyCancelled = event.statut === "annulé";
    const actionText = isCurrentlyCancelled ? "réactiver" : "annuler";

    if (!confirm(`Êtes-vous sûr de vouloir ${actionText} cet événement ?`)) {
      return;
    }

    try {
      if (isCurrentlyCancelled) {
        // Réactiver l'événement
        await apiService.reactivateEvent(id);
      } else {
        // Annuler l'événement
        await apiService.cancelEvent(id);
      }

      // Recharger les données de l'événement
      await loadEventData();
    } catch (err) {
      setError(`Erreur lors de la ${actionText} de l'événement`);
      console.error(`Error ${actionText} event:`, err);
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

  const formatDateForInput = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  };

  const generateCalendarDays = () => {
    if (!event || !event.date) return [];

    const startDate = new Date(event.date);
    let endDate;

    // Si pas de date de fin, créer une date de fin par défaut (même jour + 12 heures)
    if (!event.date_fin) {
      endDate = new Date(startDate);
      endDate.setHours(startDate.getHours() + 12);
    } else {
      endDate = new Date(event.date_fin);
    }

    const days = [];
    let currentDate = new Date(startDate);
    currentDate.setHours(0, 0, 0, 0);

    const finalDate = new Date(endDate);
    finalDate.setHours(23, 59, 59, 999);

    while (currentDate <= finalDate) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      slots.push({
        hour,
        displayTime: `${hour.toString().padStart(2, "0")}:00`,
        displayTime30: `${hour.toString().padStart(2, "0")}:30`,
      });
    }
    return slots;
  };

  const handleTrancheFormChange = (e) => {
    const { name, value, type } = e.target;
    setTrancheFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseInt(value) || 0 : value,
    }));
  };

  const handleCreateTranche = async (e) => {
    e.preventDefault();
    try {
      // TODO: Implémenter la création de tranche horaire
      // await apiService.createTrancheHoraire(id, trancheFormData);
      console.log("Création de tranche horaire:", trancheFormData);

      setShowTrancheForm(false);
      setTrancheFormData({
        nom: "",
        secteur_id: "",
        date_debut: "",
        date_fin: "",
        participants_necessaires: 1,
      });

      // Recharger les données
      // await loadEventData();
    } catch (err) {
      setError("Erreur lors de la création de la tranche horaire");
      console.error("Error creating tranche:", err);
    }
  };

  const getTranchesForTimeSlot = (day, hour, isHalfHour = false) => {
    const slotStart = new Date(day);
    slotStart.setHours(hour, isHalfHour ? 30 : 0, 0, 0);

    const slotEnd = new Date(day);
    slotEnd.setHours(hour, isHalfHour ? 59 : 29, 59, 999);

    return tranchesHoraires.filter((tranche) => {
      const trancheStart = new Date(tranche.date_debut);
      const trancheEnd = new Date(tranche.date_fin);

      // Vérifier si la tranche chevauche avec ce créneau
      return trancheStart <= slotEnd && trancheEnd >= slotStart;
    });
  };

  const generateTimelineSlots = () => {
    if (!event || !event.date) return [];

    const startDate = new Date(event.date);
    let endDate;

    // Si pas de date de fin, créer une date de fin par défaut (même jour + 12 heures)
    if (!event.date_fin) {
      endDate = new Date(startDate);
      endDate.setHours(startDate.getHours() + 12);
    } else {
      endDate = new Date(event.date_fin);
    }

    const slots = [];
    let currentTime = new Date(startDate);

    // Arrondir au début de l'heure
    currentTime.setMinutes(0, 0, 0);

    while (currentTime <= endDate) {
      slots.push({
        time: new Date(currentTime),
        displayDate: currentTime.toLocaleDateString("fr-FR", {
          weekday: "short",
          day: "numeric",
          month: "short",
        }),
        displayTime: currentTime.toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isNewDay: currentTime.getHours() === 0,
      });

      // Avancer d'1 heure
      currentTime.setHours(currentTime.getHours() + 1);
    }

    return slots;
  };

  const getTranchePosition = (tranche, timelineStart) => {
    const trancheStart = new Date(tranche.date_debut);
    const trancheEnd = new Date(tranche.date_fin);
    const timelineStartTime = new Date(timelineStart);

    // Calculer la position en heures depuis le début
    const startOffsetHours =
      (trancheStart - timelineStartTime) / (1000 * 60 * 60);
    const durationHours = (trancheEnd - trancheStart) / (1000 * 60 * 60);

    return {
      left: Math.max(0, startOffsetHours * 80), // 80px par heure
      width: durationHours * 80,
      startOffsetHours,
      durationHours,
    };
  };

  const organizeTranchesByLayers = (timeSlots) => {
    if (!timeSlots.length) return [];

    const timelineStart = timeSlots[0].time;
    const layers = [];

    // Trier les tranches par heure de début
    const sortedTranches = [...tranchesHoraires].sort(
      (a, b) => new Date(a.date_debut) - new Date(b.date_debut)
    );

    sortedTranches.forEach((tranche) => {
      const position = getTranchePosition(tranche, timelineStart);

      // Trouver la première couche où cette tranche peut s'insérer
      let layerIndex = 0;
      while (layerIndex < layers.length) {
        const layer = layers[layerIndex];
        const hasConflict = layer.some((existingTranche) => {
          const existingPos = getTranchePosition(
            existingTranche,
            timelineStart
          );
          return !(
            position.left >= existingPos.left + existingPos.width ||
            position.left + position.width <= existingPos.left
          );
        });

        if (!hasConflict) break;
        layerIndex++;
      }

      // Créer une nouvelle couche si nécessaire
      if (layerIndex === layers.length) {
        layers.push([]);
      }

      layers[layerIndex].push(tranche);
    });

    return layers;
  };

  const getBadgeById = (badgeId) => {
    return badges.find((badge) => badge.id === badgeId);
  };

  // Fonction pour vérifier si l'utilisateur est inscrit à une tranche
  const isUserInscrit = (trancheId) => {
    return userInscriptions.some(
      (inscription) => inscription.tranche_id === trancheId
    );
  };

  // Fonction pour obtenir l'ID de l'inscription de l'utilisateur
  const getUserInscriptionId = (trancheId) => {
    const inscription = userInscriptions.find(
      (inscription) => inscription.tranche_id === trancheId
    );
    return inscription ? inscription.id : null;
  };

  // Fonction pour s'inscrire à une tranche
  const handleInscription = async (trancheId) => {
    try {
      await apiService.inscrireMembre(trancheId, user.id);

      // Recharger les inscriptions de l'utilisateur
      const inscriptionsData = await apiService.getInscriptionsByMembre(
        user.id,
        id
      );
      setUserInscriptions(inscriptionsData);

      // Recharger les tranches pour mettre à jour les compteurs
      await loadEventData();
    } catch (err) {
      setError("Erreur lors de l'inscription à la tranche");
      console.error("Error inscription:", err);
    }
  };

  // Fonction pour se désinscrire d'une tranche
  const handleDesinscription = async (trancheId) => {
    try {
      const inscriptionId = getUserInscriptionId(trancheId);
      if (inscriptionId) {
        await apiService.desinscrireMembre(trancheId, inscriptionId);

        // Recharger les inscriptions de l'utilisateur
        const inscriptionsData = await apiService.getInscriptionsByMembre(
          user.id,
          id
        );
        setUserInscriptions(inscriptionsData);

        // Recharger les tranches pour mettre à jour les compteurs
        await loadEventData();
      }
    } catch (err) {
      setError("Erreur lors de la désinscription de la tranche");
      console.error("Error desinscription:", err);
    }
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

  const calendarDays = generateCalendarDays();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Style CSS pour cacher les barres de scroll */}
      <style jsx>{`
        .timeline-container ::-webkit-scrollbar {
          display: none;
        }
        .timeline-container {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

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

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Informations de l'événement */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">Informations</h2>
          <div className="space-y-3">
            <div>
              <span className="font-medium text-gray-700">Date de début :</span>
              <p className="text-gray-900">{formatDate(event.date)}</p>
            </div>

            {event.date_fin && (
              <div>
                <span className="font-medium text-gray-700">Date de fin :</span>
                <p className="text-gray-900">{formatDate(event.date_fin)}</p>
              </div>
            )}

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
                    : event.statut === "annulé"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {event.statut}
              </span>
            </div>

            {/* Affichage des badges requis */}
            {event.badges_requis && event.badges_requis.length > 0 && (
              <div>
                <span className="font-medium text-gray-700">
                  Badges requis :
                </span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {event.badges_requis.map((badgeId) => {
                    const badge = getBadgeById(badgeId);
                    if (!badge) return null;
                    return (
                      <div
                        key={badgeId}
                        className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium text-white"
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
        </Card>

        {/* Actions - seulement pour les admins */}
        {(user.role === "responsable" || user.role === "sous-admin") && (
          <Card>
            <h2 className="text-xl font-semibold mb-4">Actions</h2>
            <div className="flex flex-col gap-3">
              <Link href={`/main/events/${event.id}/edit`}>
                <button
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                  title="Modifier l'événement"
                >
                  <svg
                    className="w-5 h-5"
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
                  <span>Modifier</span>
                </button>
              </Link>

              {/* Bouton Annuler/Réactiver - seulement si l'événement n'est pas terminé */}
              {event.statut !== "terminé" && (
                <button
                  onClick={handleCancelEvent}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    event.statut === "annulé"
                      ? "bg-green-50 hover:bg-green-100 text-green-600"
                      : "bg-orange-50 hover:bg-orange-100 text-orange-600"
                  }`}
                  title={
                    event.statut === "annulé"
                      ? "Réactiver l'événement"
                      : "Annuler l'événement"
                  }
                >
                  {event.statut === "annulé" ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  )}
                  <span>
                    {event.statut === "annulé"
                      ? "Réactiver l'événement"
                      : "Annuler l'événement"}
                  </span>
                </button>
              )}

              <button
                onClick={handleDeleteEvent}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                title="Supprimer l'événement"
              >
                <svg
                  className="w-5 h-5"
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
                <span>Supprimer</span>
              </button>
            </div>
          </Card>
        )}
      </div>

      {/* Aide pour les membres */}
      {user.role === "membre" && (
        <Card className="mt-6">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg
                className="w-4 h-4 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-1">
                Comment s'inscrire aux tranches horaires ?
              </h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  • Cliquez sur une tranche horaire dans le planning ci-dessous
                  pour vous inscrire
                </p>
                <p>
                  • Les tranches avec une bordure verte sont celles où vous êtes
                  déjà inscrit
                </p>
                <p>
                  • Les tranches marquées "Complet" ne peuvent plus accepter de
                  participants
                </p>
                <p>
                  • Vous pouvez vous désinscrire en cliquant à nouveau sur une
                  tranche où vous êtes inscrit
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Calendrier de l'événement */}
      {calendarDays.length > 0 && (
        <Card className="mt-6">
          <h2 className="text-xl font-semibold mb-4">
            Planning de l'événement
          </h2>

          {/* Timeline continue */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {(() => {
              const timeSlots = generateTimelineSlots();
              const trancheLayers = organizeTranchesByLayers(timeSlots);

              return (
                <>
                  {/* En-tête avec dates */}
                  <div className="bg-gray-50 border-b border-gray-200 sticky top-0 z-50">
                    <div
                      ref={datesHeaderRef}
                      className="flex overflow-x-auto timeline-container"
                      style={{
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                        WebkitScrollbar: { display: "none" },
                      }}
                      onScroll={handleHeaderScroll}
                    >
                      <div className="w-20 flex-shrink-0 border-r border-gray-200"></div>
                      {timeSlots.map((slot, index) => (
                        <div
                          key={index}
                          className={`flex-shrink-0 w-20 p-2 text-xs font-medium text-center border-r border-gray-200 ${
                            slot.isNewDay
                              ? "bg-blue-50 text-blue-700"
                              : "text-gray-700"
                          }`}
                        >
                          {slot.isNewDay && (
                            <div className="font-semibold">
                              {slot.displayDate}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* En-tête avec heures */}
                  <div className="bg-gray-50 border-b border-gray-200 sticky top-8 z-40">
                    <div
                      ref={hoursHeaderRef}
                      className="flex overflow-x-auto timeline-container"
                      style={{
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                        WebkitScrollbar: { display: "none" },
                      }}
                      onScroll={handleHeaderScroll}
                    >
                      <div className="w-20 flex-shrink-0 p-2 text-xs font-medium text-gray-500 border-r border-gray-200">
                        Heures
                      </div>
                      {timeSlots.map((slot, index) => (
                        <div
                          key={index}
                          className="flex-shrink-0 w-20 p-2 text-xs text-center border-r border-gray-200 text-gray-600"
                        >
                          {slot.displayTime}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Zone des tranches horaires */}
                  <div
                    className="relative bg-white"
                    style={{
                      height: "440px", // Hauteur fixe pour 4 niveaux (4 * 110px)
                      minHeight: "440px",
                      maxHeight: "440px",
                    }}
                  >
                    <div
                      ref={timelineContentRef}
                      className="flex h-full overflow-hidden timeline-container"
                      style={{
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                        WebkitScrollbar: { display: "none" },
                      }}
                    >
                      {/* Colonne des niveaux */}
                      <div className="w-20 flex-shrink-0 border-r border-gray-200 bg-gray-50">
                        {Array.from({ length: 4 }, (_, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-center text-xs text-gray-500 border-b border-gray-100"
                            style={{ height: "110px" }}
                          >
                            N{index + 1}
                          </div>
                        ))}
                      </div>

                      {/* Conteneur de la grille temporelle avec largeur fixe */}
                      <div
                        className="relative bg-white"
                        style={{
                          width: timeSlots.length * 80,
                          minWidth: timeSlots.length * 80,
                          height: "100%",
                        }}
                      >
                        {/* Lignes de grille temporelle */}
                        {timeSlots.map((slot, index) => (
                          <div
                            key={index}
                            className="absolute top-0 bottom-0 border-r border-gray-100"
                            style={{ left: index * 80, width: 1 }}
                          />
                        ))}

                        {/* Lignes horizontales pour séparer les niveaux */}
                        {Array.from({ length: 4 }, (_, index) => (
                          <div
                            key={index}
                            className="absolute left-0 right-0 border-b border-gray-100"
                            style={{ top: (index + 1) * 110 }}
                          />
                        ))}

                        {/* Lignes horizontales avec padding pour l'espacement */}
                        {Array.from({ length: 4 }, (_, index) => (
                          <div
                            key={`padding-${index}`}
                            className="absolute left-0 right-0"
                            style={{
                              top: index * 110 + 5,
                              height: "10px",
                              backgroundColor: "transparent",
                            }}
                          />
                        ))}

                        {/* Lignes horizontales avec padding en bas */}
                        {Array.from({ length: 4 }, (_, index) => (
                          <div
                            key={`padding-bottom-${index}`}
                            className="absolute left-0 right-0"
                            style={{
                              top: (index + 1) * 110 - 5,
                              height: "10px",
                              backgroundColor: "transparent",
                            }}
                          />
                        ))}

                        {/* Tranches horaires - afficher seulement les 4 premiers niveaux */}
                        {trancheLayers.slice(0, 4).map((layer, layerIndex) =>
                          layer.map((tranche) => {
                            const position = getTranchePosition(
                              tranche,
                              timeSlots[0]?.time
                            );
                            const isInscrit = isUserInscrit(tranche.id);
                            const isFull =
                              tranche.participants_inscrits >=
                              tranche.participants_necessaires;

                            // MOCK DATA pour les participants (à remplacer par les vraies données)
                            const participants = [
                              { nom: "Jean Dupont", email: "jean@example.com" },
                              {
                                nom: "Marie Martin",
                                email: "marie@example.com",
                              },
                              {
                                nom: "Pierre Durand",
                                email: "pierre@example.com",
                              },
                              {
                                nom: "Sophie Bernard",
                                email: "sophie@example.com",
                              },
                              {
                                nom: "Lucas Moreau",
                                email: "lucas@example.com",
                              },
                              { nom: "Emma Petit", email: "emma@example.com" },
                              {
                                nom: "Thomas Roux",
                                email: "thomas@example.com",
                              },
                              {
                                nom: "Julie Simon",
                                email: "julie@example.com",
                              },
                            ].slice(0, tranche.participants_inscrits);

                            return (
                              <div
                                key={tranche.id}
                                className={`absolute rounded-lg shadow-sm border border-opacity-30 cursor-pointer hover:shadow-md transition-shadow group ${
                                  isInscrit ? "ring-2 ring-green-400" : ""
                                }`}
                                style={{
                                  backgroundColor: tranche.couleur,
                                  borderColor: tranche.couleur,
                                  left: position.left,
                                  width: Math.max(position.width, 60), // Largeur minimum
                                  top:
                                    layerIndex === 0
                                      ? 15 // Espacement pour N1 avec padding
                                      : layerIndex === 3
                                      ? layerIndex * 110 + 15
                                      : layerIndex * 110 + 15, // Espacement uniforme de 15px pour tous les niveaux
                                  height: 80, // Hauteur des tranches
                                }}
                                title={`${tranche.nom} - ${tranche.secteur_nom}`}
                                onClick={() => {
                                  if (user.role === "membre") {
                                    // Pour les membres, gérer l'inscription/désinscription
                                    if (isInscrit) {
                                      handleDesinscription(tranche.id);
                                    } else if (!isFull) {
                                      handleInscription(tranche.id);
                                    }
                                  } else {
                                    // Pour les admins, naviguer vers la page de gestion
                                    router.push(
                                      `/main/events/${id}/tranches/${tranche.id}`
                                    );
                                  }
                                }}
                              >
                                <div className="p-2 text-white text-xs h-full flex flex-col justify-between">
                                  <div>
                                    <div className="font-semibold truncate">
                                      {tranche.nom}
                                    </div>
                                    <div className="text-xs opacity-90">
                                      {tranche.secteur_nom}
                                    </div>
                                  </div>
                                  <div className="text-xs">
                                    <div
                                      className={`font-medium ${
                                        isFull ? "text-red-200" : ""
                                      }`}
                                    >
                                      👥 {tranche.participants_inscrits}/
                                      {tranche.participants_necessaires}
                                    </div>
                                    {isInscrit && (
                                      <div className="text-xs font-bold text-green-200">
                                        ✓ Inscrit
                                      </div>
                                    )}
                                    {isFull && !isInscrit && (
                                      <div className="text-xs text-red-200">
                                        Complet
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}

                        {/* Message si aucune tranche */}
                        {trancheLayers.length === 0 && (
                          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                            Aucune tranche horaire créée
                          </div>
                        )}

                        {/* Indicateur si plus de 4 niveaux */}
                        {trancheLayers.length > 4 && (
                          <div className="absolute bottom-2 right-2 bg-gray-800 text-white text-xs px-2 py-1 rounded-full opacity-75">
                            +{trancheLayers.length - 4} niveaux supplémentaires
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Légende */}
                  <div className="bg-gray-50 p-3 text-xs text-gray-600 border-t border-gray-200">
                    <div className="flex flex-wrap gap-4">
                      <span>
                        💡 Scroll horizontal pour naviguer dans le temps
                      </span>
                      <span>
                        🔍 Cliquez sur une tranche pour voir les détails
                      </span>
                      <span>📏 Chaque colonne = 1 heure</span>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </Card>
      )}

      {/* Gestion des tranches horaires */}
      <Card className="mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Tranches horaires</h2>
          {(user.role === "responsable" || user.role === "sous-admin") && (
            <Button
              onClick={() => setShowTrancheForm(true)}
              primaryColor={tenant?.primary_color || "#00AF00"}
              size="sm"
            >
              Ajouter une tranche
            </Button>
          )}
        </div>

        {/* Formulaire de création de tranche horaire */}
        {showTrancheForm && (
          <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <h3 className="text-lg font-medium mb-4">
              Nouvelle tranche horaire
            </h3>
            <form onSubmit={handleCreateTranche} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nom de la tranche"
                  type="text"
                  name="nom"
                  value={trancheFormData.nom}
                  onChange={handleTrancheFormChange}
                  required
                  placeholder="Ex: Service du matin"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Secteur
                  </label>
                  <select
                    name="secteur_id"
                    value={trancheFormData.secteur_id}
                    onChange={handleTrancheFormChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Sélectionner un secteur</option>
                    {/* TODO: Mapper les secteurs */}
                    <option value="1">Cuisine</option>
                    <option value="2">Service</option>
                    <option value="3">Bar</option>
                    <option value="4">Nettoyage</option>
                  </select>
                </div>

                <Input
                  label="Date et heure de début"
                  type="datetime-local"
                  name="date_debut"
                  value={trancheFormData.date_debut}
                  onChange={handleTrancheFormChange}
                  required
                  min={event?.date ? formatDateForInput(event.date) : ""}
                  max={
                    event?.date_fin ? formatDateForInput(event.date_fin) : ""
                  }
                />

                <Input
                  label="Date et heure de fin"
                  type="datetime-local"
                  name="date_fin"
                  value={trancheFormData.date_fin}
                  onChange={handleTrancheFormChange}
                  required
                  min={
                    trancheFormData.date_debut ||
                    (event?.date ? formatDateForInput(event.date) : "")
                  }
                  max={
                    event?.date_fin ? formatDateForInput(event.date_fin) : ""
                  }
                />

                <Input
                  label="Nombre de participants nécessaires"
                  type="number"
                  name="participants_necessaires"
                  value={trancheFormData.participants_necessaires}
                  onChange={handleTrancheFormChange}
                  required
                  min="1"
                  max="50"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  primaryColor={tenant?.primary_color || "#00AF00"}
                >
                  Créer la tranche
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowTrancheForm(false)}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Liste des tranches horaires */}
        {tranchesHoraires.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Aucune tranche horaire créée pour cet événement
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {tranchesHoraires.map((tranche) => {
              const isInscrit = isUserInscrit(tranche.id);
              const isFull =
                tranche.participants_inscrits >=
                tranche.participants_necessaires;

              // MOCK DATA pour les participants de cette tranche
              const participants = [
                { nom: "Jean Dupont", email: "jean@example.com" },
                { nom: "Marie Martin", email: "marie@example.com" },
                { nom: "Pierre Durand", email: "pierre@example.com" },
                { nom: "Sophie Bernard", email: "sophie@example.com" },
                { nom: "Lucas Moreau", email: "lucas@example.com" },
                { nom: "Emma Petit", email: "emma@example.com" },
                { nom: "Thomas Roux", email: "thomas@example.com" },
                { nom: "Julie Simon", email: "julie@example.com" },
              ].slice(0, tranche.participants_inscrits);

              return (
                <div
                  key={tranche.id}
                  className={`border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow ${
                    isInscrit ? "bg-green-50 border-green-200" : ""
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {tranche.nom}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Secteur: {tranche.secteur_nom}
                      </p>
                      <p className="text-sm text-gray-600">
                        📅 {formatDate(tranche.date_debut)} →{" "}
                        {formatDate(tranche.date_fin)}
                      </p>
                      <p
                        className={`text-sm ${
                          isFull ? "text-red-600 font-medium" : "text-gray-600"
                        }`}
                      >
                        👥 {tranche.participants_inscrits || 0} /{" "}
                        {tranche.participants_necessaires} participants
                        {isFull && " (Complet)"}
                      </p>
                      {isInscrit && (
                        <p className="text-sm text-green-600 font-medium">
                          ✓ Vous êtes inscrit à cette tranche
                        </p>
                      )}

                      {/* Liste des participants */}
                      {participants.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            Participants inscrits :
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {participants.map((participant, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs"
                                title={participant.email}
                              >
                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                <span className="text-gray-700">
                                  {participant.nom}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      {/* Boutons pour les membres */}
                      {user.role === "membre" && (
                        <>
                          {isInscrit ? (
                            <button
                              onClick={() => handleDesinscription(tranche.id)}
                              className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                            >
                              Se désinscrire
                            </button>
                          ) : !isFull ? (
                            <button
                              onClick={() => handleInscription(tranche.id)}
                              className="px-3 py-1 text-sm bg-green-100 hover:bg-green-200 text-green-600 rounded-lg transition-colors"
                            >
                              S'inscrire
                            </button>
                          ) : (
                            <span className="px-3 py-1 text-sm bg-gray-100 text-gray-500 rounded-lg">
                              Complet
                            </span>
                          )}
                        </>
                      )}

                      {/* Boutons pour les admins */}
                      {(user.role === "responsable" ||
                        user.role === "sous-admin") && (
                        <>
                          <button
                            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors"
                            title="Modifier la tranche"
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
                          <button
                            className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                            title="Supprimer la tranche"
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
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Liste des participations (optionnel, peut être masqué) */}
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
                    {participation.membre_nom ||
                      `Membre ID: ${participation.membre_id}`}
                  </p>
                  {participation.membre_email && (
                    <p className="text-sm text-gray-600">
                      {participation.membre_email}
                    </p>
                  )}
                  <p className="text-sm text-gray-500">
                    Statut: {participation.present ? "Présent" : "Absent"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Mes inscriptions (pour les membres) */}
      {user.role === "membre" && userInscriptions.length > 0 && (
        <Card className="mt-6">
          <h2 className="text-xl font-semibold mb-4">
            Mes inscriptions aux tranches
          </h2>
          <div className="space-y-3">
            {userInscriptions.map((inscription) => {
              const tranche = tranchesHoraires.find(
                (t) => t.id === inscription.tranche_id
              );
              if (!tranche) return null;

              return (
                <div
                  key={inscription.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-green-50"
                >
                  <div>
                    <p className="font-medium text-gray-900">{tranche.nom}</p>
                    <p className="text-sm text-gray-600">
                      Secteur: {tranche.secteur_nom}
                    </p>
                    <p className="text-sm text-gray-500">
                      📅 {formatDate(tranche.date_debut)} →{" "}
                      {formatDate(tranche.date_fin)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-green-600 font-medium">
                      ✓ Inscrit
                    </span>
                    <button
                      onClick={() => handleDesinscription(tranche.id)}
                      className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                    >
                      Se désinscrire
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
