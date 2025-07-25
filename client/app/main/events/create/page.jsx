"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../contexts/AuthContext";
import apiService from "../../../../lib/api";
import Input from "../../../../components/ui/Input";
import Button from "../../../../components/ui/Button";
import Card from "../../../../components/ui/Card";
import Link from "next/link";

export default function CreateEventPage() {
  const { user, tenant } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    nom: "",
    date: "",
    date_fin: "",
    categorie_id: "",
    tenant_id: user?.tenant_id,
    badges_requis: [], // Nouveaux badges requis
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [categoriesData, badgesData] = await Promise.all([
        apiService.getCategories(),
        // TODO: Implémenter l'API pour les badges
        // apiService.getBadges()
        Promise.resolve([]), // Temporaire
      ]);

      const filteredCategories = categoriesData.filter(
        (cat) => cat.tenant_id === user.tenant_id
      );
      setCategories(filteredCategories);

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
    } catch (err) {
      setError("Erreur lors du chargement des données");
      console.error("Error loading data:", err);
    }
  };

  const handleBadgeToggle = (badgeId) => {
    setFormData((prev) => ({
      ...prev,
      badges_requis: prev.badges_requis.includes(badgeId)
        ? prev.badges_requis.filter((id) => id !== badgeId)
        : [...prev.badges_requis, badgeId],
    }));
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Inclure le tenant_id de l'utilisateur connecté
      const eventData = {
        ...formData,
        tenant_id: user.tenant_id,
      };
      await apiService.createEvent(eventData);
      router.push("/main/dashboard");
    } catch (err) {
      setError(err.message || "Erreur lors de la création de l'événement");
      console.error("Error creating event:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          Créer un événement
        </h1>
        <p className="text-gray-600 mt-2">
          Remplissez les informations pour créer un nouvel événement
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <Input
            label="Nom de l'événement"
            type="text"
            name="nom"
            value={formData.nom}
            onChange={handleChange}
            required
            placeholder="Ex: Tournoi de football"
          />

          <Input
            label="Date et heure de début"
            type="datetime-local"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />

          <Input
            label="Date et heure de fin"
            type="datetime-local"
            name="date_fin"
            value={formData.date_fin}
            onChange={handleChange}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catégorie
            </label>
            <select
              name="categorie_id"
              value={formData.categorie_id}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Sélectionner une catégorie</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.nom}
                </option>
              ))}
            </select>
          </div>

          {/* Section des badges requis */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Badges requis (optionnel)
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Sélectionnez les badges que les participants doivent avoir pour
              accéder à cet événement. Si aucun badge n'est sélectionné,
              l'événement sera ouvert à tous.
            </p>

            {badges.length === 0 ? (
              <div className="text-sm text-gray-500 italic">
                Aucun badge disponible. Créez des badges dans la section Badges.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {badges.map((badge) => (
                  <label
                    key={badge.id}
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.badges_requis.includes(badge.id)
                        ? "bg-green-50 border-green-200"
                        : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.badges_requis.includes(badge.id)}
                      onChange={() => handleBadgeToggle(badge.id)}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm text-white font-bold"
                      style={{ backgroundColor: badge.couleur }}
                    >
                      {badge.icone}
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {badge.nom}
                    </span>
                  </label>
                ))}
              </div>
            )}

            {formData.badges_requis.length > 0 && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <svg
                    className="w-5 h-5 text-blue-500 mt-0.5"
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
                  <div>
                    <p className="text-sm font-medium text-blue-800">
                      Accès restreint
                    </p>
                    <p className="text-xs text-blue-600">
                      Seuls les membres ayant au moins un des badges
                      sélectionnés pourront voir et s'inscrire à cet événement.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex space-x-4">
            <Button
              type="submit"
              disabled={loading}
              primaryColor={tenant?.primary_color || "#00AF00"}
              className="flex-1"
            >
              {loading ? "Création..." : "Créer l'événement"}
            </Button>

            <Link href="/main/dashboard" className="flex-1">
              <Button variant="secondary" className="w-full">
                Annuler
              </Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
