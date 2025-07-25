"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import apiService from "../../../lib/api";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Input from "../../../components/ui/Input";

export default function BadgesPage() {
  const { user, tenant } = useAuth();
  const [badges, setBadges] = useState([]);
  const [membres, setMembres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // États pour la création/modification de badges
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nom: "",
    description: "",
    couleur: "#3B82F6",
    icone: "🏆",
  });

  // État pour l'attribution de badges
  const [showAttribution, setShowAttribution] = useState(null);
  const [memberBadges, setMemberBadges] = useState({});
  const [searchMember, setSearchMember] = useState("");

  useEffect(() => {
    if (user?.role === "sous-admin") {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);

      // TODO: Implémenter les vraies APIs
      // const [badgesData, membresData] = await Promise.all([
      //   apiService.getBadges(),
      //   apiService.getMembers()
      // ]);

      // MOCK DATA pour démonstration
      const mockBadges = [
        {
          id: 1,
          nom: "Bénévole expérimenté",
          description: "Plus de 50 heures de bénévolat",
          couleur: "#10B981",
          icone: "🏆",
          tenant_id: user.tenant_id,
          membres_count: 3,
        },
        {
          id: 2,
          nom: "Responsable cuisine",
          description: "Autorisé à travailler en cuisine",
          couleur: "#F59E0B",
          icone: "👨‍🍳",
          tenant_id: user.tenant_id,
          membres_count: 2,
        },
        {
          id: 3,
          nom: "Nouveau membre",
          description: "Membre depuis moins de 6 mois",
          couleur: "#8B5CF6",
          icone: "🌟",
          tenant_id: user.tenant_id,
          membres_count: 5,
        },
      ];

      const membresData = await apiService.getMembers();
      const membresFiltered = membresData.filter(
        (m) => m.tenant_id === user.tenant_id
      );

      setBadges(mockBadges);
      setMembres(membresFiltered);

      // TODO: Charger les attributions existantes
      // const attributions = await apiService.getBadgeAttributions();
      // Simuler quelques attributions pour la démo
      const mockAttributions = {
        1: [membresFiltered[0]?.id, membresFiltered[1]?.id], // Badge 1 attribué aux 2 premiers membres
        2: [membresFiltered[0]?.id], // Badge 2 attribué au premier membre
        3: [membresFiltered[2]?.id, membresFiltered[3]?.id], // Badge 3 attribué aux membres 3 et 4
      };

      // Stocker les attributions dans un état séparé
      setMemberBadges(mockAttributions);
    } catch (err) {
      setError("Erreur lors du chargement des badges");
      console.error("Error loading badges:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      // TODO: Implémenter la création réelle
      // await apiService.createBadge({ ...formData, tenant_id: user.tenant_id });

      console.log("Création badge:", formData);

      // Simulation de création
      const newBadge = {
        id: Date.now(),
        ...formData,
        tenant_id: user.tenant_id,
        membres_count: 0,
      };

      setBadges((prev) => [...prev, newBadge]);
      setIsCreating(false);
      setFormData({
        nom: "",
        description: "",
        couleur: "#3B82F6",
        icone: "🏆",
      });
    } catch (err) {
      setError("Erreur lors de la création du badge");
      console.error("Error creating badge:", err);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      // TODO: Implémenter la modification réelle
      // await apiService.updateBadge(editingId, formData);

      console.log("Modification badge:", editingId, formData);

      setBadges((prev) =>
        prev.map((badge) =>
          badge.id === editingId ? { ...badge, ...formData } : badge
        )
      );
      setEditingId(null);
      setFormData({
        nom: "",
        description: "",
        couleur: "#3B82F6",
        icone: "🏆",
      });
    } catch (err) {
      setError("Erreur lors de la modification du badge");
      console.error("Error updating badge:", err);
    }
  };

  const handleDelete = async (badgeId) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce badge ?")) {
      return;
    }

    try {
      // TODO: Implémenter la suppression réelle
      // await apiService.deleteBadge(badgeId);

      console.log("Suppression badge:", badgeId);
      setBadges((prev) => prev.filter((badge) => badge.id !== badgeId));
    } catch (err) {
      setError("Erreur lors de la suppression du badge");
      console.error("Error deleting badge:", err);
    }
  };

  const handleEdit = (badge) => {
    setEditingId(badge.id);
    setFormData({
      nom: badge.nom,
      description: badge.description,
      couleur: badge.couleur,
      icone: badge.icone,
    });
    setIsCreating(false);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setIsCreating(false);
    setFormData({ nom: "", description: "", couleur: "#3B82F6", icone: "🏆" });
  };

  // Fonction pour vérifier si un membre a un badge
  const hasBadge = (badgeId, membreId) => {
    return memberBadges[badgeId]?.includes(membreId) || false;
  };

  // Fonction améliorée pour gérer l'attribution
  const toggleBadgeAttribution = async (badgeId, membreId) => {
    try {
      const currentlyHasBadge = hasBadge(badgeId, membreId);

      // TODO: Implémenter l'API réelle
      // if (currentlyHasBadge) {
      //   await apiService.removeBadgeFromMember(badgeId, membreId);
      // } else {
      //   await apiService.attributeBadgeToMember(badgeId, membreId);
      // }

      console.log(
        `${currentlyHasBadge ? "Retirer" : "Attribuer"} badge ${badgeId} ${
          currentlyHasBadge ? "from" : "to"
        } member ${membreId}`
      );

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
                ? Math.max(0, badge.membres_count - 1)
                : badge.membres_count + 1,
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

  const filteredBadges = badges.filter(
    (badge) =>
      badge.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      badge.description.toLowerCase().includes(searchTerm.toLowerCase())
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

  if (user?.role !== "sous-admin") {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <div className="text-center py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Accès non autorisé
            </h1>
            <p className="text-gray-600">
              Vous n'avez pas les permissions nécessaires pour accéder à cette
              page.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card>
        <div className="text-center mb-8">
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: tenant?.primary_color || "#00AF00" }}
          >
            Gestion des Badges
          </h1>
          <p className="text-gray-600">
            Créez et gérez les badges pour organiser vos membres
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Barre de recherche et bouton création */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <Input
            type="text"
            placeholder="Rechercher un badge..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />

          {!isCreating && !editingId && (
            <Button
              onClick={() => setIsCreating(true)}
              primaryColor={tenant?.primary_color || "#00AF00"}
            >
              Créer un badge
            </Button>
          )}
        </div>

        {/* Formulaire de création/modification */}
        {(isCreating || editingId) && (
          <div className="mb-6 p-4 border border-gray-200 rounded-lg">
            <h3 className="text-lg font-medium mb-4">
              {editingId ? "Modifier le badge" : "Créer un nouveau badge"}
            </h3>
            <form onSubmit={editingId ? handleUpdate : handleCreate}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <Input
                  label="Nom du badge"
                  type="text"
                  value={formData.nom}
                  onChange={(e) =>
                    setFormData({ ...formData, nom: e.target.value })
                  }
                  placeholder="Ex: Bénévole expérimenté"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Icône
                  </label>
                  <Input
                    type="text"
                    value={formData.icone}
                    onChange={(e) =>
                      setFormData({ ...formData, icone: e.target.value })
                    }
                    placeholder="🏆"
                    className="text-center text-xl"
                    maxLength="2"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Description du badge et de ses critères"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows="2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Couleur
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={formData.couleur}
                      onChange={(e) =>
                        setFormData({ ...formData, couleur: e.target.value })
                      }
                      className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={formData.couleur}
                      onChange={(e) =>
                        setFormData({ ...formData, couleur: e.target.value })
                      }
                      className="flex-1"
                      placeholder="#3B82F6"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  primaryColor={tenant?.primary_color || "#00AF00"}
                >
                  {editingId ? "Modifier" : "Créer"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCancelEdit}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Liste des badges */}
        {filteredBadges.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? "Aucun badge trouvé" : "Aucun badge créé"}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredBadges.map((badge) => (
              <Card
                key={badge.id}
                className="hover:shadow-md transition-shadow"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-xl text-white font-bold"
                        style={{ backgroundColor: badge.couleur }}
                      >
                        {badge.icone}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {badge.nom}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {badge.membres_count} membre
                          {badge.membres_count !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(badge)}
                        className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded transition-colors"
                        title="Modifier le badge"
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
                        onClick={() => handleDelete(badge.id)}
                        className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded transition-colors"
                        title="Supprimer le badge"
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

                  <p className="text-sm text-gray-600">{badge.description}</p>

                  <div className="pt-2 border-t border-gray-200">
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

                  {/* Panel d'attribution amélioré */}
                  {showAttribution === badge.id && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-sm">
                          Attribuer aux membres
                        </h4>
                        <span className="text-xs text-gray-500">
                          {memberBadges[badge.id]?.length || 0} /{" "}
                          {membres.length} membres
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
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
