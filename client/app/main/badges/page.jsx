"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import apiService from "../../../lib/api";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Input from "../../../components/ui/Input";
import Link from "next/link";

export default function BadgesPage() {
  const { user, tenant } = useAuth();
  const [badges, setBadges] = useState([]);
  const [membres, setMembres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingBadge, setEditingBadge] = useState(null);
  const [showAttribution, setShowAttribution] = useState(null);
  const [memberBadges, setMemberBadges] = useState({});
  const [searchMember, setSearchMember] = useState("");
  const [formData, setFormData] = useState({
    nom: "",
    description: "",
    icone: "",
    couleur: "#3B82F6",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Charger les badges et membres
      const [badgesData, membresData] = await Promise.all([
        apiService.getBadges(),
        apiService.getMembers(),
      ]);
      setBadges(badgesData);
      setMembres(membresData);

      // Charger les attributions pour chaque badge
      const attributions = {};
      for (const badge of badgesData) {
        try {
          const badgeAttributions = await apiService.getBadgeAttributions(
            badge.id
          );
          attributions[badge.id] = badgeAttributions.map((a) => a.membre_id);
        } catch (err) {
          console.error(
            `Error loading attributions for badge ${badge.id}:`,
            err
          );
          attributions[badge.id] = [];
        }
      }
      setMemberBadges(attributions);
    } catch (err) {
      setError("Erreur lors du chargement des données");
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateBadge = async (e) => {
    e.preventDefault();
    try {
      await apiService.createBadge(formData);
      setShowCreateForm(false);
      setFormData({
        nom: "",
        description: "",
        icone: "",
        couleur: "#3B82F6",
      });
      await loadData();
    } catch (err) {
      setError("Erreur lors de la création du badge");
      console.error("Error creating badge:", err);
    }
  };

  const handleUpdateBadge = async (e) => {
    e.preventDefault();
    try {
      await apiService.updateBadge(editingBadge.id, formData);
      setEditingBadge(null);
      setFormData({
        nom: "",
        description: "",
        icone: "",
        couleur: "#3B82F6",
      });
      await loadData();
    } catch (err) {
      setError("Erreur lors de la modification du badge");
      console.error("Error updating badge:", err);
    }
  };

  const handleDeleteBadge = async (badgeId) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce badge ?")) {
      return;
    }

    try {
      await apiService.deleteBadge(badgeId);
      await loadData();
    } catch (err) {
      setError("Erreur lors de la suppression du badge");
      console.error("Error deleting badge:", err);
    }
  };

  const startEdit = (badge) => {
    setEditingBadge(badge);
    setFormData({
      nom: badge.nom,
      description: badge.description || "",
      icone: badge.icone || "",
      couleur: badge.couleur || "#3B82F6",
    });
  };

  const cancelEdit = () => {
    setEditingBadge(null);
    setFormData({
      nom: "",
      description: "",
      icone: "",
      couleur: "#3B82F6",
    });
  };

  // Fonction pour vérifier si un membre a un badge
  const hasBadge = (badgeId, membreId) => {
    return memberBadges[badgeId]?.includes(membreId) || false;
  };

  // Fonction pour gérer l'attribution/retrait de badge
  const toggleBadgeAttribution = async (badgeId, membreId) => {
    try {
      const currentlyHasBadge = hasBadge(badgeId, membreId);

      if (currentlyHasBadge) {
        // Retirer le badge
        const attributions = await apiService.getBadgeAttributions(badgeId);
        const attribution = attributions.find((a) => a.membre_id === membreId);
        if (attribution) {
          await apiService.retirerAttribution(attribution.id);
        }
      } else {
        // Attribuer le badge
        await apiService.attribuerBadge(badgeId, membreId);
      }

      // Mettre à jour l'état local
      setMemberBadges((prev) => {
        const newState = { ...prev };
        if (!newState[badgeId]) {
          newState[badgeId] = [];
        }

        if (currentlyHasBadge) {
          // Retirer le badge
          newState[badgeId] = newState[badgeId].filter((id) => id !== membreId);
        } else {
          // Ajouter le badge
          newState[badgeId] = [...newState[badgeId], membreId];
        }

        return newState;
      });

      // Mettre à jour le compteur dans les badges
      setBadges((prev) =>
        prev.map((badge) => {
          if (badge.id === badgeId) {
            return {
              ...badge,
              membres_count: currentlyHasBadge
                ? Math.max(0, (badge.membres_count || 0) - 1)
                : (badge.membres_count || 0) + 1,
            };
          }
          return badge;
        })
      );
    } catch (err) {
      setError("Erreur lors de la modification de l'attribution");
      console.error("Error toggling badge attribution:", err);
    }
  };

  // Fonction pour filtrer les membres dans le panel d'attribution
  const getFilteredMembersForAttribution = (badgeId) => {
    return membres.filter(
      (membre) =>
        membre.nom.toLowerCase().includes(searchMember.toLowerCase()) ||
        membre.email.toLowerCase().includes(searchMember.toLowerCase())
    );
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          Gestion des badges
        </h1>
        <p className="text-gray-600 mt-2">
          Créez et gérez les badges pour vos membres
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Bouton pour créer un nouveau badge */}
      <div className="mb-6">
        <Button
          onClick={() => setShowCreateForm(true)}
          primaryColor={tenant?.primary_color || "#00AF00"}
        >
          Créer un nouveau badge
        </Button>
      </div>

      {/* Formulaire de création */}
      {showCreateForm && (
        <Card className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Nouveau badge</h2>
          <form onSubmit={handleCreateBadge} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nom du badge"
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleFormChange}
                required
                placeholder="Ex: Bénévole expérimenté"
              />

              <Input
                label="Description"
                type="text"
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                placeholder="Description du badge"
              />

              <Input
                label="Icône (emoji)"
                type="text"
                name="icone"
                value={formData.icone}
                onChange={handleFormChange}
                placeholder="🏆"
                maxLength="10"
              />

              <Input
                label="Couleur"
                type="color"
                name="couleur"
                value={formData.couleur}
                onChange={handleFormChange}
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                primaryColor={tenant?.primary_color || "#00AF00"}
              >
                Créer le badge
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowCreateForm(false)}
              >
                Annuler
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Formulaire de modification */}
      {editingBadge && (
        <Card className="mb-6">
          <h2 className="text-xl font-semibold mb-4">
            Modifier le badge "{editingBadge.nom}"
          </h2>
          <form onSubmit={handleUpdateBadge} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nom du badge"
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleFormChange}
                required
                placeholder="Ex: Bénévole expérimenté"
              />

              <Input
                label="Description"
                type="text"
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                placeholder="Description du badge"
              />

              <Input
                label="Icône (emoji)"
                type="text"
                name="icone"
                value={formData.icone}
                onChange={handleFormChange}
                placeholder="🏆"
                maxLength="10"
              />

              <Input
                label="Couleur"
                type="color"
                name="couleur"
                value={formData.couleur}
                onChange={handleFormChange}
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                primaryColor={tenant?.primary_color || "#00AF00"}
              >
                Modifier le badge
              </Button>
              <Button type="button" variant="secondary" onClick={cancelEdit}>
                Annuler
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Liste des badges */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Badges existants</h2>
        {badges.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Aucun badge créé</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium text-white"
                    style={{ backgroundColor: badge.couleur }}
                  >
                    <span>{badge.icone}</span>
                    <span>{badge.nom}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(badge)}
                      className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors"
                      title="Modifier"
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
                      onClick={() => handleDeleteBadge(badge.id)}
                      className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                      title="Supprimer"
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
                  </div>
                </div>

                {badge.description && (
                  <p className="text-sm text-gray-600 mb-2">
                    {badge.description}
                  </p>
                )}

                <div className="text-xs text-gray-500">
                  <p>Membres attribués: {badge.membres_count || 0}</p>
                </div>

                {/* Bouton d'attribution */}
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      setShowAttribution(
                        showAttribution === badge.id ? null : badge.id
                      )
                    }
                    className="w-full"
                  >
                    {showAttribution === badge.id ? "Masquer" : "Attribuer"}
                  </Button>
                </div>

                {/* Panel d'attribution */}
                {showAttribution === badge.id && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-sm">
                        Attribuer aux membres
                      </h4>
                      <span className="text-xs text-gray-500">
                        {memberBadges[badge.id]?.length || 0} / {membres.length}{" "}
                        membres
                      </span>
                    </div>

                    {/* Barre de recherche pour les membres */}
                    <div className="mb-3">
                      <Input
                        type="text"
                        placeholder="Rechercher un membre..."
                        value={searchMember}
                        onChange={(e) => setSearchMember(e.target.value)}
                        className="text-sm"
                        size="sm"
                      />
                    </div>

                    {/* Actions rapides */}
                    <div className="flex gap-2 mb-3">
                      <button
                        onClick={() => {
                          // Sélectionner tous les membres visibles
                          const visibleMembers =
                            getFilteredMembersForAttribution(badge.id);
                          visibleMembers.forEach((membre) => {
                            if (!hasBadge(badge.id, membre.id)) {
                              toggleBadgeAttribution(badge.id, membre.id);
                            }
                          });
                        }}
                        className="px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded text-xs font-medium transition-colors"
                      >
                        Tout sélectionner
                      </button>
                      <button
                        onClick={() => {
                          // Désélectionner tous les membres visibles
                          const visibleMembers =
                            getFilteredMembersForAttribution(badge.id);
                          visibleMembers.forEach((membre) => {
                            if (hasBadge(badge.id, membre.id)) {
                              toggleBadgeAttribution(badge.id, membre.id);
                            }
                          });
                        }}
                        className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-xs font-medium transition-colors"
                      >
                        Tout désélectionner
                      </button>
                    </div>

                    {/* Liste des membres avec checkboxes */}
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {getFilteredMembersForAttribution(badge.id).length ===
                      0 ? (
                        <div className="text-center py-4 text-gray-500 text-sm">
                          Aucun membre trouvé
                        </div>
                      ) : (
                        getFilteredMembersForAttribution(badge.id).map(
                          (membre) => (
                            <label
                              key={membre.id}
                              className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                                hasBadge(badge.id, membre.id)
                                  ? "bg-green-50 border border-green-200"
                                  : "bg-white border border-gray-200 hover:bg-gray-50"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={hasBadge(badge.id, membre.id)}
                                onChange={() =>
                                  toggleBadgeAttribution(badge.id, membre.id)
                                }
                                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {membre.nom}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                  {membre.email}
                                </p>
                              </div>
                              <div className="flex-shrink-0">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                    membre.role === "responsable"
                                      ? "bg-blue-100 text-blue-800"
                                      : membre.role === "sous-admin"
                                      ? "bg-purple-100 text-purple-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {membre.role}
                                </span>
                              </div>
                            </label>
                          )
                        )
                      )}
                    </div>

                    {/* Résumé des changements */}
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>
                          Membres avec ce badge:{" "}
                          {memberBadges[badge.id]?.length || 0}
                        </span>
                        <button
                          onClick={() => {
                            setShowAttribution(null);
                            setSearchMember("");
                          }}
                          className="text-green-600 hover:text-green-700 font-medium"
                        >
                          Fermer
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
