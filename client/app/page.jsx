"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Image from "next/image";
import { useTenant } from "../hooks/useTenant";

export default function Home() {
  const router = useRouter();
  const { tenant, loading: tenantLoading, error: tenantError } = useTenant();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (tenant) {
      loadArticles();
    }
  }, [tenant]);

  const loadArticles = async () => {
    try {
      setLoading(true);

      // Charger les articles publiés pour ce tenant
      const articlesResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/articles/public?tenant_id=${tenant.id}`
      );
      if (articlesResponse.ok) {
        const articlesData = await articlesResponse.json();
        setArticles(articlesData);
      }
    } catch (err) {
      console.error("Erreur lors du chargement des articles:", err);
      setError("Erreur lors du chargement des actualités");
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header
        className="bg-white shadow-sm"
        style={{
          borderBottom: `3px solid ${tenant?.primary_color || "#00AF00"}`,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {tenant?.logo_url && (
                <div className="w-20 h-20 relative">
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
                {tenant?.texte_intro && (
                  <p className="text-gray-600 text-sm"></p>
                )}
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

      {/* Hero Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2
              className="text-4xl font-bold mb-6"
              style={{ color: tenant?.primary_color || "#00AF00" }}
            >
              {tenant?.titre_principal || `Bienvenue chez ${tenant?.nom}`}
            </h2>
            {tenant?.texte_intro && (
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                {tenant.texte_intro}
              </p>
            )}
            {tenant?.image_accueil_url && (
              <div className="flex justify-center mb-8">
                <div className="w-full max-w-2xl h-64 relative">
                  <Image
                    src={tenant.image_accueil_url}
                    alt="Image d'accueil"
                    fill
                    className="object-cover rounded-xl shadow"
                    priority
                  />
                </div>
              </div>
            )}
            <div className="flex justify-center">
              <Link href="#actualites">
                <Button
                  primaryColor={tenant?.primary_color || "#00AF00"}
                  size="lg"
                >
                  Voir les actualités
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Présentation Section */}
      {tenant?.texte_presentation && (
        <section className="py-12 bg-gray-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3
              className="text-2xl font-bold mb-4 text-center"
              style={{ color: tenant?.primary_color || "#00AF00" }}
            >
              Présentation
            </h3>
            <p className="text-lg text-gray-700 text-center whitespace-pre-line">
              {tenant.texte_presentation}
            </p>
          </div>
        </section>
      )}

      {/* Actualités Section */}
      <section id="actualites" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3
              className="text-3xl font-bold mb-4"
              style={{ color: tenant?.primary_color || "#00AF00" }}
            >
              Actualités
            </h3>
            <p className="text-gray-600">
              Restez informés des dernières nouvelles de notre organisation
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
              <p className="mt-4 text-gray-500">Chargement des actualités...</p>
            </div>
          ) : articles.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <p className="text-gray-500">
                  Aucune actualité disponible pour le moment
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <Card
                  key={article.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <div className="space-y-4">
                    {/* Image de l'article */}
                    {article.image_url && (
                      <div className="w-full h-48 rounded-lg overflow-hidden">
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

                    <div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">
                        {article.titre}
                      </h4>
                      <p className="text-sm text-gray-500 mb-3">
                        📅{" "}
                        {formatDate(
                          article.date_publication || article.created_at
                        )}
                      </p>
                      <p className="text-gray-600 line-clamp-3">
                        {article.contenu.length > 150
                          ? `${article.contenu.substring(0, 150)}...`
                          : article.contenu}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <Link href={`/articles/${article.id}`}>
                        <Button
                          size="sm"
                          primaryColor={tenant?.primary_color || "#00AF00"}
                          variant="outline"
                        >
                          Lire la suite
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer avec contact */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Section contact */}
            {(tenant?.email_contact ||
              tenant?.telephone_contact ||
              tenant?.adresse_contact ||
              tenant?.lien_instagram) && (
              <div className="mb-6 flex flex-col items-center space-y-2">
                {tenant?.email_contact && (
                  <a
                    href={`mailto:${tenant.email_contact}`}
                    className="text-gray-200 hover:text-white flex items-center space-x-2"
                  >
                    <span>{tenant.email_contact}</span>
                  </a>
                )}
                {tenant?.telephone_contact && (
                  <a
                    href={`tel:${tenant.telephone_contact}`}
                    className="text-gray-200 hover:text-white flex items-center space-x-2"
                  >
                    <span>{tenant.telephone_contact}</span>
                  </a>
                )}
                {tenant?.adresse_contact && (
                  <span className="text-gray-200 flex items-center space-x-2">
                    <span>{tenant.adresse_contact}</span>
                  </span>
                )}
                {tenant?.lien_instagram && (
                  <a
                    href={tenant.lien_instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-200 hover:text-white flex items-center"
                  >
                    <img
                      src="/icons/instagram.svg"
                      alt="Instagram"
                      className="w-7 h-7 inline-block filter invert"
                    />
                  </a>
                )}
              </div>
            )}

            <p className="text-gray-300 mb-6">
              Gestion des événements et participations avec Membora
            </p>

            <div className="flex justify-center">
              <Link
                href="/auth/login"
                className="text-gray-300 hover:text-white"
              >
                Connexion
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
