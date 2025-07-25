"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import apiService from "../../../lib/api";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Input from "../../../components/ui/Input";
import Link from "next/link";

export default function ArticlesPage() {
  const { user, tenant } = useAuth();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  useEffect(() => {
    if (user?.role === "sous-admin") {
      loadArticles();
    }
  }, [user]);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const articlesData = await apiService.getArticles();
      setArticles(articlesData);
    } catch (err) {
      setError("Erreur lors du chargement des articles");
      console.error("Error loading articles:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteArticle = async (articleId) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) {
      return;
    }

    try {
      await apiService.deleteArticle(articleId);
      await loadArticles(); // Recharger la liste
    } catch (err) {
      setError("Erreur lors de la suppression de l'article");
      console.error("Error deleting article:", err);
    }
  };

  const handleArchiveArticle = async (articleId) => {
    try {
      await apiService.archiveArticle(articleId);
      await loadArticles(); // Recharger la liste
    } catch (err) {
      setError("Erreur lors de l'archivage de l'article");
      console.error("Error archiving article:", err);
    }
  };

  const handleUnarchiveArticle = async (articleId) => {
    try {
      await apiService.unarchiveArticle(articleId);
      await loadArticles(); // Recharger la liste
    } catch (err) {
      setError("Erreur lors de la désarchivage de l'article");
      console.error("Error unarchiving article:", err);
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

  const getStatusBadge = (status) => {
    const badges = {
      publié: "bg-green-100 text-green-800",
      brouillon: "bg-yellow-100 text-yellow-800",
      archivé: "bg-gray-100 text-gray-800",
    };
    return badges[status] || "bg-gray-100 text-gray-800";
  };

  const filteredArticles = articles.filter((article) => {
    const matchesSearch = article.titre
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = !selectedStatus || article.etat === selectedStatus;
    return matchesSearch && matchesStatus;
  });

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
            Gestion des Articles
          </h1>
          <p className="text-gray-600">
            Gérez les articles et actualités de votre organisation
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Filtres et recherche */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <Input
            type="text"
            placeholder="Rechercher un article..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Tous les statuts</option>
            <option value="publié">Publié</option>
            <option value="brouillon">Brouillon</option>
            <option value="archivé">Archivé</option>
          </select>

          <Link href="/main/articles/create">
            <Button primaryColor={tenant?.primary_color || "#00AF00"}>
              Créer un article
            </Button>
          </Link>
        </div>

        {/* Liste des articles */}
        {filteredArticles.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <p className="text-gray-500">
                {selectedStatus
                  ? "Aucun article avec ce statut"
                  : "Aucun article disponible"}
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredArticles.map((article) => (
              <Card
                key={article.id}
                className="hover:shadow-lg transition-shadow"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {article.titre}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        📅{" "}
                        {formatDate(
                          article.date_publication || article.created_at
                        )}
                      </p>
                      {article.auteur_nom && (
                        <p className="text-sm text-gray-500 mb-2">
                          ✍️ Par {article.auteur_nom}
                        </p>
                      )}
                      <p className="text-gray-600 line-clamp-2">
                        {article.contenu.length > 200
                          ? `${article.contenu.substring(0, 200)}...`
                          : article.contenu}
                      </p>
                    </div>

                    <div className="ml-4 flex flex-col items-end space-y-2">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                          article.etat
                        )}`}
                      >
                        {article.etat}
                      </span>

                      {/* Image de l'article */}
                      {article.image_url && (
                        <div className="w-24 h-16 rounded-lg overflow-hidden border border-gray-200">
                          <img
                            src={article.image_url}
                            alt={article.titre}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                    <Link href={`/main/articles/${article.id}/edit`}>
                      <Button variant="secondary" size="sm">
                        Modifier
                      </Button>
                    </Link>

                    {article.etat === "publié" ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleArchiveArticle(article.id)}
                      >
                        Archiver
                      </Button>
                    ) : article.etat === "archivé" ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleUnarchiveArticle(article.id)}
                      >
                        Désarchiver
                      </Button>
                    ) : null}

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleDeleteArticle(article.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Supprimer
                    </Button>

                    {article.etat === "publié" && (
                      <Link href={`/articles/${article.id}`} target="_blank">
                        <Button
                          size="sm"
                          primaryColor={tenant?.primary_color || "#00AF00"}
                        >
                          Voir en public
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
