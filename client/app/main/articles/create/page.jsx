"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../contexts/AuthContext";
import apiService from "../../../../lib/api";
import Input from "../../../../components/ui/Input";
import Button from "../../../../components/ui/Button";
import Card from "../../../../components/ui/Card";
import ImageUpload from "../../../../components/ui/ImageUpload";
import Link from "next/link";

export default function CreateArticlePage() {
  const { user, tenant } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    titre: "",
    contenu: "",
    etat: "brouillon",
    date_publication: "",
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (file, previewUrl) => {
    setSelectedImage(file);
    setImagePreview(previewUrl);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Créer un FormData pour envoyer l'image avec les autres données
      const formDataToSend = new FormData();

      // Ajouter les données de l'article
      formDataToSend.append("titre", formData.titre);
      formDataToSend.append("contenu", formData.contenu);
      formDataToSend.append("etat", formData.etat);
      formDataToSend.append("auteur_id", user.id);
      formDataToSend.append("tenant_id", user.tenant_id);

      // Ajouter la date de publication si elle existe
      if (formData.etat === "publié" && !formData.date_publication) {
        formDataToSend.append("date_publication", new Date().toISOString());
      } else if (formData.date_publication) {
        formDataToSend.append("date_publication", formData.date_publication);
      }

      // Ajouter l'image si elle existe
      if (selectedImage) {
        formDataToSend.append("image", selectedImage);
      }

      await apiService.createArticle(formDataToSend);
      router.push("/main/articles");
    } catch (err) {
      setError(err.message || "Erreur lors de la création de l'article");
      console.error("Error creating article:", err);
    } finally {
      setLoading(false);
    }
  };

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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link
          href="/main/articles"
          className="text-green-600 hover:text-green-500 mb-4 inline-block"
        >
          ← Retour aux articles
        </Link>
        <h1
          className="text-3xl font-bold"
          style={{ color: tenant?.primary_color || "#00AF00" }}
        >
          Créer un article
        </h1>
        <p className="text-gray-600 mt-2">
          Rédigez un nouvel article pour votre organisation
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
            label="Titre de l'article"
            type="text"
            name="titre"
            value={formData.titre}
            onChange={handleChange}
            required
            placeholder="Titre de votre article"
          />

          <ImageUpload
            label="Image de l'article (optionnel)"
            onChange={handleImageChange}
            value={imagePreview}
            maxSize={5 * 1024 * 1024} // 5MB
            previewClassName="w-full h-64 object-cover rounded-lg"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contenu de l'article
            </label>
            <textarea
              name="contenu"
              value={formData.contenu}
              onChange={handleChange}
              required
              rows={12}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Rédigez le contenu de votre article..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statut
            </label>
            <select
              name="etat"
              value={formData.etat}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="brouillon">Brouillon</option>
              <option value="publié">Publié</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date de publication (optionnel)
            </label>
            <input
              type="datetime-local"
              name="date_publication"
              value={formData.date_publication}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-1">
              Si non spécifiée et que le statut est "publié", l'article sera
              publié immédiatement.
            </p>
          </div>

          <div className="flex space-x-4">
            <Button
              type="submit"
              disabled={loading}
              primaryColor={tenant?.primary_color || "#00AF00"}
              className="flex-1"
            >
              {loading ? "Création..." : "Créer l'article"}
            </Button>

            <Link href="/main/articles" className="flex-1">
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
