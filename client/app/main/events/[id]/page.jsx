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
  const [trancheInscriptions, setTrancheInscriptions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isUserInscritEvent, setIsUserInscritEvent] = useState(false); // Nouvel état pour inscription directe
  const [eventParticipants, setEventParticipants] = useState([]); // Nouvel état pour participants directs

  // Refs pour synchroniser le scroll
  const datesHeaderRef = useRef(null);
  const hoursHeaderRef = useRef(null);
  const timelineContentRef = useRef(null);

  // État pour le formulaire de création de tranche horaire
  const [showTrancheForm, setShowTrancheForm] = useState(false);
  const [trancheFormData, setTrancheFormData] = useState({
    nom: "",
    secteur: "",
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
      const [eventData, participationsData, tranchesData, badgesData] =
        await Promise.all([
          apiService.getEvent(id),
          apiService.getParticipationsByEvent(id),
          apiService.getTranchesByEvenement(id),
          apiService.getBadges(),
        ]);
      setEvent(eventData);
      setParticipations(participationsData);
      setTranchesHoraires(tranchesData);
      setBadges(badgesData);

      // Debug: afficher les données des badges
      console.log("Badges data from API:", badgesData);
      console.log("Event badges_requis:", eventData.badges_requis);

      // Debug: afficher les données des tranches
      console.log("Tranches data:", tranchesData);

      // Charger les inscriptions de toutes les tranches
      const inscriptionsPromises = tranchesData.map((tranche) =>
        apiService.getTrancheInscriptions(tranche.id)
      );

      try {
        const inscriptionsResults = await Promise.all(inscriptionsPromises);
        const inscriptionsMap = {};
        tranchesData.forEach((tranche, index) => {
          inscriptionsMap[tranche.id] = inscriptionsResults[index];
        });
        setTrancheInscriptions(inscriptionsMap);
        console.log("Inscriptions data:", inscriptionsMap);
      } catch (err) {
        console.error("Error loading tranche inscriptions:", err);
      }

      // Charger les inscriptions de l'utilisateur pour cet événement
      const inscriptionsData = await apiService.getInscriptionsByMembre(
        user.id,
        id
      );
      setUserInscriptions(inscriptionsData);

      // Pour les événements sociaux (has_planning = false), charger les inscriptions directes
      if (!eventData.has_planning) {
        try {
          const [eventParticipantsData, userEventInscriptionData] =
            await Promise.all([
              apiService.getEventParticipants(id),
              apiService.getUserEventInscription(id, user.id),
            ]);
          setEventParticipants(eventParticipantsData);
          setIsUserInscritEvent(userEventInscriptionData !== null);
        } catch (err) {
          console.error("Error loading event participants:", err);
        }
      }

      // Charger la catégorie de l'événement
      if (eventData.categorie_id) {
        try {
          const categoryData = await apiService.getCategory(
            eventData.categorie_id
          );
          setCategory(categoryData);
        } catch (err) {
          console.error("Error loading category:", err);
        }
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

  const handleCancelEvent = async () => {
    console.log("handleCancelEvent appelé");
    console.log("Event ID:", id);
    console.log("Event statut actuel:", event.statut);

    const isCurrentlyCancelled = event.statut === "annulé";
    const actionText = isCurrentlyCancelled ? "réactiver" : "annuler";

    console.log("Action à effectuer:", actionText);

    if (!confirm(`Êtes-vous sûr de vouloir ${actionText} cet événement ?`)) {
      console.log("Action annulée par l'utilisateur");
      return;
    }

    try {
      console.log("Tentative d'appel API...");
      if (isCurrentlyCancelled) {
        // Réactiver l'événement
        console.log("Appel de reactivateEvent...");
        await apiService.reactivateEvent(id);
        console.log("reactivateEvent réussi");
      } else {
        // Annuler l'événement
        console.log("Appel de cancelEvent...");
        await apiService.cancelEvent(id);
        console.log("cancelEvent réussi");
      }

      // Recharger les données de l'événement
      console.log("Rechargement des données...");
      await loadEventData();
      console.log("Données rechargées avec succès");
    } catch (err) {
      console.error("Erreur complète:", err);
      setError(`Erreur lors de la ${actionText} de l'événement`);
      console.error(`Error ${actionText} event:`, err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date non définie";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Date invalide";
    }

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
      await apiService.createTranche({
        evenement_id: parseInt(id, 10),
        nom: trancheFormData.nom,
        debut: trancheFormData.date_debut,
        fin: trancheFormData.date_fin,
        valeur_coches: 1, // ou autre valeur par défaut
        max_participants: trancheFormData.participants_necessaires,
        description: "", // ou ajouter un champ dans le formulaire
        secteur: trancheFormData.secteur, // ou adapter selon la logique
        couleur: "#3B82F6", // ou ajouter un champ couleur dans le formulaire
      });
      setShowTrancheForm(false);
      setTrancheFormData({
        nom: "",
        secteur: "",
        date_debut: "",
        date_fin: "",
        participants_necessaires: 1,
      });
      await loadEventData();
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
      if (!tranche.date_debut || !tranche.date_fin) return false;

      const trancheStart = new Date(tranche.date_debut);
      const trancheEnd = new Date(tranche.date_fin);

      // Vérifier si les dates sont valides
      if (isNaN(trancheStart.getTime()) || isNaN(trancheEnd.getTime())) {
        return false;
      }

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
    if (!tranche.date_debut || !tranche.date_fin || !timelineStart) {
      return { left: 0, width: 60, startOffsetHours: 0, durationHours: 1 };
    }

    const trancheStart = new Date(tranche.date_debut);
    const trancheEnd = new Date(tranche.date_fin);
    const timelineStartTime = new Date(timelineStart);

    // Vérifier si les dates sont valides
    if (
      isNaN(trancheStart.getTime()) ||
      isNaN(trancheEnd.getTime()) ||
      isNaN(timelineStartTime.getTime())
    ) {
      return { left: 0, width: 60, startOffsetHours: 0, durationHours: 1 };
    }

    // Calculer la position en heures depuis le début
    const startOffsetHours =
      (trancheStart - timelineStartTime) / (1000 * 60 * 60);
    const durationHours = (trancheEnd - trancheStart) / (1000 * 60 * 60);

    return {
      left: Math.max(0, startOffsetHours * 80), // 80px par heure
      width: Math.max(durationHours * 80, 60), // Largeur minimum de 60px
      startOffsetHours,
      durationHours,
    };
  };

  const organizeTranchesByLayers = (timeSlots) => {
    if (!timeSlots.length) return [];

    const timelineStart = timeSlots[0].time;
    const layers = [];

    // Trier les tranches par heure de début et filtrer celles avec des dates invalides
    const sortedTranches = [...tranchesHoraires]
      .filter((tranche) => {
        if (!tranche.date_debut || !tranche.date_fin) return false;
        const start = new Date(tranche.date_debut);
        const end = new Date(tranche.date_fin);
        return !isNaN(start.getTime()) && !isNaN(end.getTime());
      })
      .sort((a, b) => new Date(a.date_debut) - new Date(b.date_debut));

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
    // Vérifier que l'événement n'est pas annulé
    if (event.statut === "annulé") {
      setError("Impossible de s'inscrire : cet événement est annulé");
      return;
    }

    try {
      await apiService.inscrireTranche(trancheId, user.id);

      // Recharger les inscriptions de l'utilisateur pour cet événement
      const inscriptionsData = await apiService.getInscriptionsByMembre(
        user.id,
        id
      );
      setUserInscriptions(inscriptionsData);

      // Recharger les inscriptions de la tranche spécifique
      const trancheInscriptionsData = await apiService.getTrancheInscriptions(
        trancheId
      );
      setTrancheInscriptions((prev) => ({
        ...prev,
        [trancheId]: trancheInscriptionsData,
      }));

      // Mettre à jour le compteur de participants dans les tranches
      setTranchesHoraires((prev) =>
        prev.map((tranche) =>
          tranche.id === trancheId
            ? {
                ...tranche,
                participants_inscrits: (tranche.participants_inscrits || 0) + 1,
              }
            : tranche
        )
      );
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
        await apiService.desinscrireTranche(inscriptionId);

        // Recharger les inscriptions de l'utilisateur pour cet événement
        const inscriptionsData = await apiService.getInscriptionsByMembre(
          user.id,
          id
        );
        setUserInscriptions(inscriptionsData);

        // Recharger les inscriptions de la tranche spécifique
        const trancheInscriptionsData = await apiService.getTrancheInscriptions(
          trancheId
        );
        setTrancheInscriptions((prev) => ({
          ...prev,
          [trancheId]: trancheInscriptionsData,
        }));

        // Mettre à jour le compteur de participants dans les tranches
        setTranchesHoraires((prev) =>
          prev.map((tranche) =>
            tranche.id === trancheId
              ? {
                  ...tranche,
                  participants_inscrits: Math.max(
                    0,
                    (tranche.participants_inscrits || 0) - 1
                  ),
                }
              : tranche
          )
        );
      }
    } catch (err) {
      setError("Erreur lors de la désinscription de la tranche");
      console.error("Error desinscription:", err);
    }
  };

  // Fonction pour modifier une tranche horaire
  const handleEditTranche = (trancheId) => {
    router.push(`/main/events/${id}/tranches/${trancheId}/edit`);
  };

  // Fonction pour supprimer une tranche horaire
  const handleDeleteTranche = async (trancheId) => {
    if (
      !confirm("Êtes-vous sûr de vouloir supprimer cette tranche horaire ?")
    ) {
      return;
    }

    try {
      await apiService.deleteTranche(trancheId);
      // Recharger les données
      await loadEventData();
    } catch (err) {
      setError("Erreur lors de la suppression de la tranche horaire");
      console.error("Error deleting tranche:", err);
    }
  };

  // Fonction pour s'inscrire directement à l'événement (événements sociaux)
  const handleInscriptionEvent = async () => {
    // Vérifier que l'événement n'est pas annulé
    if (event.statut === "annulé") {
      setError("Impossible de s'inscrire : cet événement est annulé");
      return;
    }

    try {
      await apiService.inscrireEvent(id, user.id);
      setIsUserInscritEvent(true);

      // Recharger la liste des participants
      const participantsData = await apiService.getEventParticipants(id);
      setEventParticipants(participantsData);

      setError(""); // Effacer les erreurs précédentes
    } catch (err) {
      setError("Erreur lors de l'inscription à l'événement");
      console.error("Error inscription event:", err);
    }
  };

  // Fonction pour se désinscrire directement de l'événement (événements sociaux)
  const handleDesinscriptionEvent = async () => {
    try {
      await apiService.desinscrireEvent(id, user.id);
      setIsUserInscritEvent(false);

      // Recharger la liste des participants
      const participantsData = await apiService.getEventParticipants(id);
      setEventParticipants(participantsData);

      setError(""); // Effacer les erreurs précédentes
    } catch (err) {
      setError("Erreur lors de la désinscription de l'événement");
      console.error("Error desinscription event:", err);
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

      {/* Message d'alerte pour événement annulé */}
      {event.statut === "annulé" && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-orange-400 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-orange-800">
                Événement annulé
              </h3>
              <p className="text-sm text-orange-700 mt-1">
                Cet événement a été annulé. Les inscriptions sont temporairement
                désactivées mais seront conservées en cas de réactivation.
              </p>
            </div>
          </div>
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

        {/* Statistiques des participants */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">Participants</h2>
          <div className="space-y-4">
            {event.has_planning ? (
              // Pour les événements avec planning
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">
                    Tranches horaires :
                  </span>
                  <span className="text-lg font-bold text-gray-900">
                    {tranchesHoraires.length}
                  </span>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">
                    Total participants :
                  </span>
                  <span className="text-lg font-bold text-green-600">
                    {Object.values(trancheInscriptions).reduce(
                      (total, participants) => total + participants.length,
                      0
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Places totales :
                  </span>
                  <span className="text-lg font-bold text-blue-600">
                    {tranchesHoraires.reduce(
                      (total, tranche) =>
                        total + tranche.participants_necessaires,
                      0
                    )}
                  </span>
                </div>
              </div>
            ) : (
              // Pour les événements sociaux
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700">
                    Participants inscrits :
                  </span>
                  <span className="text-lg font-bold text-green-600">
                    {eventParticipants.length}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Type d'événement :
                  </span>
                  <span className="text-sm text-orange-600 font-medium">
                    Événement social
                  </span>
                </div>
              </div>
            )}

            {/* Indicateur pour l'utilisateur connecté */}
            {user.role === "membre" && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                {event.has_planning ? (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Mes inscriptions :
                    </span>
                    <span className="text-sm font-bold text-blue-600">
                      {userInscriptions.length}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Mon statut :
                    </span>
                    <span
                      className={`text-sm font-bold ${
                        isUserInscritEvent ? "text-green-600" : "text-gray-500"
                      }`}
                    >
                      {isUserInscritEvent ? "✓ Inscrit" : "Non inscrit"}
                    </span>
                  </div>
                )}
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
              {event.has_planning ? (
                <>
                  <h3 className="font-medium text-gray-900 mb-1">
                    Comment s'inscrire aux tranches horaires ?
                  </h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      • Cliquez sur une tranche horaire dans le planning
                      ci-dessous pour vous inscrire
                    </p>
                    <p>
                      • Les tranches avec une bordure verte sont celles où vous
                      êtes déjà inscrit
                    </p>
                    <p>
                      • Les tranches marquées "Complet" ne peuvent plus accepter
                      de participants
                    </p>
                    <p>
                      • Vous pouvez vous désinscrire en cliquant à nouveau sur
                      une tranche où vous êtes inscrit
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="font-medium text-gray-900 mb-1">
                    Événement social - Inscription directe
                  </h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>
                      • Cet événement n'a pas de planning de tranches horaires
                    </p>
                    <p>
                      • Vous pouvez vous inscrire directement à l'événement
                      complet
                    </p>
                    <p>
                      • Aucune heure de bénévolat ne sera comptabilisée
                      (événement lucratif)
                    </p>
                    <p>• Vous pouvez vous désinscrire à tout moment</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Calendrier de l'événement - seulement pour les événements avec planning */}
      {event.has_planning && calendarDays.length > 0 && (
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

                            // Utiliser les vraies données d'inscriptions du backend
                            const participants =
                              trancheInscriptions[tranche.id] || [];

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
                                    } else if (
                                      !isFull &&
                                      event.statut !== "annulé"
                                    ) {
                                      handleInscription(tranche.id);
                                    } else if (event.statut === "annulé") {
                                      // Afficher un message d'erreur
                                      setError(
                                        "Impossible de s'inscrire : cet événement est annulé"
                                      );
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
                                      <svg
                                        className="inline w-3 h-3 mr-1"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                        />
                                      </svg>
                                      {tranche.participants_inscrits}/
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
                      <span className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-1"
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
                        Scroll horizontal pour naviguer dans le temps
                      </span>
                      <span className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                        Cliquez sur une tranche pour voir les détails
                      </span>
                      <span className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                        Chaque colonne = 1 heure
                      </span>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </Card>
      )}

      {/* Inscription directe pour événements sociaux */}
      {!event.has_planning &&
        (user.role === "membre" ||
          user.role === "responsable" ||
          user.role === "sous-admin") && (
          <Card className="mt-6">
            <h2 className="text-xl font-semibold mb-4">
              Inscription à l'événement
            </h2>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 mb-2">{event.nom}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Événement social - Aucune heure de bénévolat
                </p>
                <p className="text-sm text-gray-500">
                  <svg
                    className="inline w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  {formatDate(event.date)} → {formatDate(event.date_fin)}
                </p>
              </div>

              <div className="ml-4">
                {isUserInscritEvent ? (
                  <div className="text-center">
                    <div className="text-sm text-green-600 font-medium mb-2">
                      ✓ Vous êtes inscrit
                    </div>
                    <button
                      onClick={handleDesinscriptionEvent}
                      className="px-4 py-2 text-sm bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                    >
                      Se désinscrire
                    </button>
                  </div>
                ) : event.statut === "annulé" ? (
                  <div className="text-center">
                    <div className="text-sm text-orange-600 font-medium mb-2">
                      Événement annulé
                    </div>
                    <span className="px-4 py-2 text-sm bg-orange-100 text-orange-600 rounded-lg">
                      Inscriptions fermées
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={handleInscriptionEvent}
                    className="px-4 py-2 text-sm bg-green-100 hover:bg-green-200 text-green-600 rounded-lg transition-colors"
                  >
                    S'inscrire à l'événement
                  </button>
                )}
              </div>
            </div>
          </Card>
        )}

      {/* Debug info - à supprimer après résolution */}
      <Card className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Debug Info</h2>
        <div className="space-y-2 text-sm">
          <p>
            <strong>Event ID:</strong> {event?.id}
          </p>
          <p>
            <strong>Event has_planning:</strong>{" "}
            {event?.has_planning ? "true" : "false"}
          </p>
          <p>
            <strong>User role:</strong> {user?.role}
          </p>
          <p>
            <strong>User ID:</strong> {user?.id}
          </p>
          <p>
            <strong>isUserInscritEvent:</strong>{" "}
            {isUserInscritEvent ? "true" : "false"}
          </p>
          <p>
            <strong>Event participants count:</strong>{" "}
            {eventParticipants?.length || 0}
          </p>
          <p>
            <strong>Condition check:</strong>{" "}
            {!event?.has_planning && user?.role === "membre" ? "true" : "false"}
          </p>
        </div>
      </Card>

      {/* Gestion des tranches horaires - seulement pour les événements avec planning */}
      {event.has_planning && (
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
                      name="secteur"
                      value={trancheFormData.secteur}
                      onChange={handleTrancheFormChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="">Sélectionner un secteur</option>
                      <option value="Cuisine">Cuisine</option>
                      <option value="Service">Service</option>
                      <option value="Bar">Bar</option>
                      <option value="Nettoyage">Nettoyage</option>
                      <option value="Accueil">Accueil</option>
                      <option value="Logistique">Logistique</option>
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

                // Utiliser les vraies données d'inscriptions du backend
                const participants = trancheInscriptions[tranche.id] || [];

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
                          <svg
                            className="inline w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          {formatDate(tranche.date_debut)} →{" "}
                          {formatDate(tranche.date_fin)}
                        </p>
                        <p
                          className={`text-sm ${
                            isFull
                              ? "text-red-600 font-medium"
                              : "text-gray-600"
                          }`}
                        >
                          <svg
                            className="inline w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          {tranche.participants_inscrits || 0} /{" "}
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
                                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm"
                                  title={`${
                                    participant.email
                                  } - Inscrit le ${new Date(
                                    participant.date_inscription
                                  ).toLocaleDateString("fr-FR")}`}
                                >
                                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                  <span className="font-medium text-gray-700">
                                    {participant.prenom} {participant.nom}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(
                                      participant.date_inscription
                                    ).toLocaleDateString("fr-FR")}
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
                            ) : event.statut === "annulé" ? (
                              <span className="px-3 py-1 text-sm bg-orange-100 text-orange-600 rounded-lg">
                                Événement annulé
                              </span>
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
                              onClick={() => handleEditTranche(tranche.id)}
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
                              onClick={() => handleDeleteTranche(tranche.id)}
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
      )}

      {/* Participants à l'événement - pour tous les rôles et types d'événements */}
      <Card className="mt-6">
        <h2 className="text-xl font-semibold mb-4">
          Participants à l'événement
        </h2>

        {event.has_planning ? (
          // Pour les événements avec planning - afficher les participants par tranche
          <div className="space-y-4">
            {tranchesHoraires.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Aucune tranche horaire créée pour cet événement
              </div>
            ) : (
              tranchesHoraires.map((tranche) => {
                const participants = trancheInscriptions[tranche.id] || [];
                return (
                  <div
                    key={tranche.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-900">
                        {tranche.nom} - {tranche.secteur_nom}
                      </h3>
                      <span className="text-sm text-gray-600">
                        {participants.length} /{" "}
                        {tranche.participants_necessaires} participants
                      </span>
                    </div>

                    {participants.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {participants.map((participant, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm"
                            title={`${
                              participant.email
                            } - Inscrit le ${new Date(
                              participant.date_inscription
                            ).toLocaleDateString("fr-FR")}`}
                          >
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span className="font-medium text-gray-700">
                              {participant.prenom} {participant.nom}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(
                                participant.date_inscription
                              ).toLocaleDateString("fr-FR")}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">
                        Aucun participant inscrit à cette tranche
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        ) : (
          // Pour les événements sociaux - afficher les participants directs
          <div>
            {eventParticipants.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">
                    Participants inscrits directement
                  </h3>
                  <span className="text-sm text-gray-600">
                    {eventParticipants.length} participant(s)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {eventParticipants.map((participant, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg"
                      title={`${
                        participant.membre_email
                      } - Inscrit le ${new Date(
                        participant.date_inscription
                      ).toLocaleDateString("fr-FR")}`}
                    >
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-700">
                          {participant.membre_prenom} {participant.membre_nom}
                        </div>
                        <div className="text-xs text-gray-500">
                          Inscrit le{" "}
                          {new Date(
                            participant.date_inscription
                          ).toLocaleDateString("fr-FR")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Aucun participant inscrit à cet événement
              </div>
            )}
          </div>
        )}
      </Card>

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
                      <svg
                        className="inline w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      {formatDate(tranche.date_debut)} →{" "}
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
