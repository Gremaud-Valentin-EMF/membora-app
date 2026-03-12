"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../../../../../../contexts/AuthContext";
import apiService from "../../../../../../../lib/api";
import Button from "../../../../../../../components/ui/Button";
import Card from "../../../../../../../components/ui/Card";
import Input from "../../../../../../../components/ui/Input";
import Link from "next/link";

export default function EditTranchePage() {
  const { id: eventId, trancheId } = useParams();
  const { user, tenant } = useAuth();
  const router = useRouter();

  const [event, setEvent] = useState(null);
  const [tranche, setTranche] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    nom: "",
    secteur: "",
    date_debut: "",
    date_fin: "",
    participants_necessaires: 1,
    description: "",
    couleur: "#3B82F6",
  });

  useEffect(() => {
    loadData();
  }, [eventId, trancheId]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Charger l'événement
      const eventData = await apiService.getEvent(eventId);
      setEvent(eventData);

      // Charger la tranche horaire
      const trancheData = await apiService.getTranche(trancheId);
      setTranche(trancheData);

      // Préparer les données du formulaire
      setFormData({
        nom: trancheData.nom || "",
        secteur: trancheData.secteur || "",
        date_debut: trancheData.date_debut
          ? new Date(trancheData.date_debut).toISOString().slice(0, 16)
          : "",
        date_fin: trancheData.date_fin
          ? new Date(trancheData.date_fin).toISOString().slice(0, 16)
          : "",
        participants_necessaires: trancheData.participants_necessaires || 1,
        description: trancheData.description || "",
        couleur: trancheData.couleur || "#3B82F6",
      });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiService.updateTranche(trancheId, {
        nom: formData.nom,
        secteur: formData.secteur,
        debut: formData.date_debut,
        fin: formData.date_fin,
        max_participants: parseInt(formData.participants_necessaires),
        description: formData.description,
        couleur: formData.couleur,
      });

      // Rediriger vers la page de l'événement
      router.push(`/main/events/${eventId}`);
    } catch (err) {
      setError("Erreur lors de la modification de la tranche horaire");
      console.error("Error updating tranche:", err);
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          Modifier la tranche horaire
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

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de la tranche
              </label>
              <Input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleFormChange}
                required
                placeholder="Ex: Service du matin"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secteur
              </label>
              <select
                name="secteur"
                value={formData.secteur}
                onChange={handleFormChange}
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date et heure de début
              </label>
              <Input
                type="datetime-local"
                name="date_debut"
                value={formData.date_debut}
                onChange={handleFormChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date et heure de fin
              </label>
              <Input
                type="datetime-local"
                name="date_fin"
                value={formData.date_fin}
                onChange={handleFormChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre maximum de participants
              </label>
              <Input
                type="number"
                name="participants_necessaires"
                value={formData.participants_necessaires}
                onChange={handleFormChange}
                min="1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Couleur
              </label>
              <Input
                type="color"
                name="couleur"
                value={formData.couleur}
                onChange={handleFormChange}
                className="h-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (optionnel)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Description de la tranche horaire..."
            />
          </div>

          <div className="flex gap-3">
            <Button
              type="submit"
              primaryColor={tenant?.primary_color || "#00AF00"}
            >
              Modifier la tranche
            </Button>
            <Link href={`/main/events/${eventId}`}>
              <Button variant="secondary">Annuler</Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
