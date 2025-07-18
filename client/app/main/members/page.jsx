"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import apiService from "../../../lib/api";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Input from "../../../components/ui/Input";

export default function MembersPage() {
  const { user, tenant } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (user?.role === "sous-admin") {
      loadMembers();
    }
  }, [user]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const membersData = await apiService.getMembers();
      setMembers(membersData);
    } catch (err) {
      setError("Erreur lors du chargement des membres");
      console.error("Error loading members:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSetResponsable = async (memberId) => {
    try {
      await apiService.setResponsable(memberId);
      await loadMembers(); // Recharger la liste
    } catch (err) {
      setError("Erreur lors de la promotion du membre");
      console.error("Error setting responsable:", err);
    }
  };

  const handleUnsetResponsable = async (memberId) => {
    try {
      await apiService.unsetResponsable(memberId);
      await loadMembers(); // Recharger la liste
    } catch (err) {
      setError("Erreur lors de la rétrogradation du membre");
      console.error("Error unsetting responsable:", err);
    }
  };

  const handleDeleteMember = async (memberId) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce membre ?")) {
      return;
    }

    try {
      await apiService.deleteMember(memberId);
      await loadMembers(); // Recharger la liste
    } catch (err) {
      setError("Erreur lors de la suppression du membre");
      console.error("Error deleting member:", err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Non spécifié";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const filteredMembers = members.filter(
    (member) =>
      member.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (user?.role !== "sous-admin") {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Accès refusé
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
      <Card>
        <div className="text-center mb-8">
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: tenant?.primary_color || "#00AF00" }}
          >
            Gestion des Membres
          </h1>
          <p className="text-gray-600">
            Gérez les membres de votre organisation
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Barre de recherche */}
        <div className="mb-6">
          <Input
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>

        {filteredMembers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {searchTerm
                ? "Aucun membre trouvé"
                : "Aucun membre dans l'organisation"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Membre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rôle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date d'inscription
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMembers.map((member) => (
                  <tr key={member.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {member.nom}
                        </div>
                        <div className="text-sm text-gray-500">
                          {member.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          member.role === "sous-admin"
                            ? "bg-purple-100 text-purple-800"
                            : member.role === "responsable"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {member.role === "sous-admin" && "Sous-Admin"}
                        {member.role === "responsable" && "Responsable"}
                        {member.role === "membre" && "Membre"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(member.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {member.role === "membre" && (
                        <Button
                          size="sm"
                          onClick={() => handleSetResponsable(member.id)}
                          primaryColor={tenant?.primary_color || "#00AF00"}
                        >
                          Promouvoir
                        </Button>
                      )}
                      {member.role === "responsable" && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleUnsetResponsable(member.id)}
                        >
                          Rétrograder
                        </Button>
                      )}
                      {member.id !== user.id && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleDeleteMember(member.id)}
                        >
                          Supprimer
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
