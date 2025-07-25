"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../../../../contexts/AuthContext";
import apiService from "../../../../../lib/api";
import Input from "../../../../../components/ui/Input";
import Button from "../../../../../components/ui/Button";
import Card from "../../../../../components/ui/Card";
import ImageUpload from "../../../../../components/ui/ImageUpload";
import Link from "next/link";

export default function EditArticlePage() {
  const { id } = useParams();
  const { user, tenant } = useAuth();
  const router = useRouter();

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    titre: "",
    contenu: "",
    etat: "brouillon",
    date_publication: "",
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [existingImageUrl, setExistingImageUrl] = useState("");

  useEffect(() => {
    loadArticle();
  }, [id]);

  const loadArticle = async () => {
    try {
      setLoading(true);
      const articleData = await apiService.getArticle(id);
      setArticle(articleData);

      // Formater la date pour l'input datetime-local
      const publicationDate = articleData.date_publication
        ? new Date(articleData.date_publication).toISOString().slice(0, 16)
        : "";

      setFormData({
        titre: articleData.titre,
        contenu: articleData.contenu,
        etat: articleData.etat,
        date_publication: publicationDate,
      });

      // Charger l'image existante si elle existe
      if (articleData.image_url) {
        setExistingImageUrl(articleData.image_url);
        setImagePreview(articleData.image_url);
      }
    } catch (err) {
      setError("Erreur lors du chargement de l'article");
      console.error("Error loading article:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (file, previewUrl) => {
    setSelectedImage(file);
    setImagePreview(previewUrl);
    // Si une nouvelle image est sélectionnée, effacer l'URL de l'ancienne
    if (file) {
      setExistingImageUrl("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      // Créer un FormData pour envoyer l'image avec les autres données
      const formDataToSend = new FormData();

      // Ajouter les données de l'article
      formDataToSend.append("titre", formData.titre);
      formDataToSend.append("contenu", formData.contenu);
      formDataToSend.append("etat", formData.etat);

      // Ajouter la date de publication si elle existe
      if (formData.etat === "publié" && !formData.date_publication) {
        formDataToSend.append("date_publication", new Date().toISOString());
      } else if (formData.date_publication) {
        formDataToSend.append("date_publication", formData.date_publication);
      }

      // Ajouter l'image si une nouvelle est sélectionnée
      if (selectedImage) {
        formDataToSend.append("image", selectedImage);
      }

      // Indiquer si on garde l'image existante
      if (existingImageUrl && !selectedImage) {
        formDataToSend.append("keep_existing_image", "true");
      }

      await apiService.updateArticle(id, formDataToSend);
      router.push("/main/articles");
    } catch (err) {
      setError(err.message || "Erreur lors de la mise à jour de l'article");
      console.error("Error updating article:", err);
    } finally {
      setSaving(false);
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

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Article non trouvé
          </h1>
          <Link href="/main/articles">
            <Button primaryColor={tenant?.primary_color || "#00AF00"}>
              Retour aux articles
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
          href="/main/articles"
          className="text-green-600 hover:text-green-500 mb-4 inline-block"
        >
          ← Retour aux articles
        </Link>
        <h1
          className="text-3xl font-bold"
          style={{ color: tenant?.primary_color || "#00AF00" }}
        >
          Modifier l'article
        </h1>
        <p className="text-gray-600 mt-2">
          Modifiez le contenu de votre article
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
              <option value="archivé">Archivé</option>
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
              disabled={saving}
              primaryColor={tenant?.primary_color || "#00AF00"}
              className="flex-1"
            >
              {saving ? "Sauvegarde..." : "Sauvegarder"}
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
