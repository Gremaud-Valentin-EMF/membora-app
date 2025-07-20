"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Image from "next/image";
import { useTenant } from "../../../hooks/useTenant";

export default function ArticleDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { tenant, loading: tenantLoading, error: tenantError } = useTenant();
  const [article, setArticle] = useState(null);
  const [author, setAuthor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (tenant) {
      loadArticleData();
    }
  }, [id, tenant]);

  const loadArticleData = async () => {
    try {
      setLoading(true);

      // Charger l'article
      const articleResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/articles/public/${id}`
      );
      if (!articleResponse.ok) {
        throw new Error("Article non trouvé");
      }
      const articleData = await articleResponse.json();
      setArticle(articleData);

      // Charger les données de l'auteur
      if (articleData.auteur_id) {
        const authorResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/membres/public/${articleData.auteur_id}`
        );
        if (authorResponse.ok) {
          const authorData = await authorResponse.json();
          setAuthor(authorData);
        }
      }
    } catch (err) {
      console.error("Erreur lors du chargement de l'article:", err);
      setError(err.message || "Erreur lors du chargement de l'article");
    } finally {
      setLoading(false);
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

  if (tenantLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (tenantError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Erreur</h1>
          <p className="text-gray-600 mb-4">{tenantError}</p>
          <Button onClick={() => window.location.reload()}>Réessayer</Button>
        </div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Organisation non trouvée
          </h1>
          <p className="text-gray-600 mb-4">
            L'organisation demandée n'existe pas.
          </p>
          <Button
            onClick={() => (window.location.href = "http://localhost:3000")}
          >
            Retour à l'accueil
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de l'article...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || "Article non trouvé"}
          </h1>
          <Link href="/">
            <Button primaryColor={tenant?.primary_color || "#00AF00"}>
              Retour à l'accueil
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header
        className="bg-white shadow-sm"
        style={{
          borderBottom: `3px solid ${tenant?.primary_color || "#00AF00"}`,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {tenant?.logo_url && (
                <div className="w-12 h-12 relative">
                  <Image
                    src={tenant.logo_url}
                    alt={`Logo ${tenant.nom}`}
                    fill
                    className="object-contain"
                  />
                </div>
              )}
              <div>
                <h1
                  className="text-2xl font-bold"
                  style={{ color: tenant?.primary_color || "#00AF00" }}
                >
                  {tenant?.nom || "Membora"}
                </h1>
                <p className="text-gray-600 text-sm">
                  Gestion des événements et participations
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button
                  primaryColor={tenant?.primary_color || "#00AF00"}
                  variant="outline"
                >
                  Connexion
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button primaryColor={tenant?.primary_color || "#00AF00"}>
                  S'inscrire
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Article Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link
            href="/"
            className="text-green-600 hover:text-green-500 mb-4 inline-block"
          >
            ← Retour à l'accueil
          </Link>
        </div>

        <Card className="p-8">
          <article>
            {/* Article Header */}
            <header className="mb-8">
              <h1
                className="text-4xl font-bold mb-4"
                style={{ color: tenant?.primary_color || "#00AF00" }}
              >
                {article.titre}
              </h1>

              <div className="flex items-center space-x-4 text-gray-600 mb-6">
                <span>
                  📅{" "}
                  {formatDate(article.date_publication || article.created_at)}
                </span>
                {author && <span>✍️ Par {author.nom}</span>}
              </div>

              <div className="flex items-center space-x-2">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    article.etat === "publié"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {article.etat}
                </span>
              </div>
            </header>

            {/* Article Content */}
            <div className="prose prose-lg max-w-none">
              <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                {article.contenu}
              </div>
            </div>

            {/* Article Footer */}
            <footer className="mt-12 pt-8 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <p>
                    Publié le{" "}
                    {formatDate(article.date_publication || article.created_at)}
                  </p>
                  {author && <p>par {author.nom}</p>}
                </div>

                <div className="flex space-x-4">
                  <Link href="/">
                    <Button
                      variant="outline"
                      primaryColor={tenant?.primary_color || "#00AF00"}
                    >
                      Retour aux actualités
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button primaryColor={tenant?.primary_color || "#00AF00"}>
                      Rejoindre l'organisation
                    </Button>
                  </Link>
                </div>
              </div>
            </footer>
          </article>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h4
              className="text-xl font-semibold mb-4"
              style={{ color: tenant?.primary_color || "#00AF00" }}
            >
              {tenant?.nom}
            </h4>
            <p className="text-gray-300 mb-6">
              Gestion des événements et participations avec Membora
            </p>
            <div className="flex justify-center space-x-6">
              <Link
                href="/auth/login"
                className="text-gray-300 hover:text-white"
              >
                Connexion
              </Link>
              <Link
                href="/auth/register"
                className="text-gray-300 hover:text-white"
              >
                Inscription
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
