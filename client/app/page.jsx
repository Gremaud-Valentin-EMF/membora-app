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
  const [showAllArticles, setShowAllArticles] = useState(false);

  useEffect(() => {
    if (tenant) {
      loadArticles();
    }
  }, [tenant]);

  const loadArticles = async () => {
    try {
      setLoading(true);

      // Charger les articles publiés pour ce tenant
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
      const articlesResponse = await fetch(
        `${apiUrl}/articles/public?tenant_id=${tenant.id}`
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
    <div className="min-h-screen bg-white">
      {/* Header élégant */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 backdrop-blur-sm bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {tenant?.logo_url && (
                <div className="w-16 h-16 relative">
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
                  className="text-xl font-bold"
                  style={{ color: tenant?.primary_color || "#00AF00" }}
                >
                  {tenant?.nom || "Membora"}
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Link href="/auth/login">
                <Button
                  primaryColor={tenant?.primary_color || "#00AF00"}
                  variant="outline"
                  size="sm"
                >
                  Connexion
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button
                  primaryColor={tenant?.primary_color || "#00AF00"}
                  size="sm"
                >
                  S'inscrire
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section moderne avec layout asymétrique */}
      <section className="relative py-16 lg:py-24 bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Contenu texte */}
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                  <span className="block">
                    {tenant?.titre_principal?.split(" ").slice(0, -1).join(" ")}
                  </span>
                  <span
                    className="block mt-2"
                    style={{ color: tenant?.primary_color || "#00AF00" }}
                  >
                    {tenant?.titre_principal?.split(" ").slice(-1)[0] ||
                      tenant?.nom}
                  </span>
                </h1>

                {tenant?.texte_intro && (
                  <p className="text-lg lg:text-xl text-gray-600 leading-relaxed">
                    {tenant.texte_intro}
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="#actualites">
                  <Button
                    primaryColor={tenant?.primary_color || "#00AF00"}
                    size="lg"
                    className="px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Découvrir nos actualités
                  </Button>
                </Link>
              </div>
            </div>

            {/* Image d'accueil */}
            {tenant?.image_accueil_url && (
              <div className="relative">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src={tenant.image_accueil_url}
                    alt="Image d'accueil"
                    className="w-full h-auto object-cover"
                  />
                  {/* Overlay décoratif */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
                </div>
                {/* Élément décoratif */}
                <div
                  className="absolute -top-4 -right-4 w-24 h-24 rounded-full opacity-20"
                  style={{
                    backgroundColor: tenant?.primary_color || "#00AF00",
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Section présentation moderne */}
      {tenant?.texte_presentation && (
        <section className="py-20 lg:py-32 bg-white relative overflow-hidden">
          {/* Éléments décoratifs en arrière-plan */}
          <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-gray-50 to-transparent rounded-full -translate-x-36 -translate-y-36" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-gray-50 to-transparent rounded-full translate-x-48 translate-y-48" />

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-3 gap-12 items-center">
              {/* Titre */}
              <div className="lg:col-span-1">
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                  À propos de nous
                </h2>
                <div
                  className="w-16 h-1 rounded-full mb-8"
                  style={{
                    backgroundColor: tenant?.primary_color || "#00AF00",
                  }}
                />
              </div>

              {/* Contenu */}
              <div className="lg:col-span-2">
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 lg:p-12 shadow-lg border border-gray-100">
                  <p className="text-lg lg:text-xl text-gray-700 leading-relaxed whitespace-pre-line">
                    {tenant.texte_presentation}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Section actualités moderne */}
      <section id="actualites" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl lg:text-4xl font-bold mb-6 text-gray-900">
              Nos actualités
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Restez informés des dernières nouvelles et événements de notre
              organisation
            </p>
            <div
              className="w-24 h-1 mx-auto rounded-full mt-6"
              style={{ backgroundColor: tenant?.primary_color || "#00AF00" }}
            />
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div
                className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
                style={{ borderColor: tenant?.primary_color || "#00AF00" }}
              />
              <p className="text-gray-500 text-lg">
                Chargement des actualités...
              </p>
            </div>
          ) : articles.length === 0 ? (
            <div className="bg-gray-50 rounded-2xl p-12 text-center">
              <div className="text-6xl mb-4">📰</div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                Aucune actualité pour le moment
              </h4>
              <p className="text-gray-600">
                Revenez bientôt pour découvrir nos dernières nouvelles
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {(showAllArticles ? articles : articles.slice(0, 3)).map(
                (article) => (
                  <div
                    key={article.id}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
                  >
                    <div className="flex flex-col lg:flex-row">
                      {/* Image de l'article */}
                      {article.image_url && (
                        <div className="lg:w-2/5">
                          <div className="w-full h-64 lg:h-full">
                            <img
                              src={article.image_url}
                              alt={article.titre}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Contenu de l'article */}
                      <div
                        className={`flex-1 p-8 ${
                          article.image_url ? "lg:w-3/5" : "w-full"
                        }`}
                      >
                        <div className="space-y-6">
                          <div>
                            <h4 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                              {article.titre}
                            </h4>
                            <div className="flex items-center text-sm text-gray-500 mb-6">
                              <svg
                                className="w-4 h-4 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                              {formatDate(
                                article.date_publication || article.created_at
                              )}
                            </div>
                            <p className="text-gray-700 leading-relaxed text-lg">
                              {article.contenu.length > 400
                                ? `${article.contenu.substring(0, 400)}...`
                                : article.contenu}
                            </p>
                          </div>

                          <div className="pt-6 border-t border-gray-100">
                            <Link href={`/articles/${article.id}`}>
                              <Button
                                primaryColor={
                                  tenant?.primary_color || "#00AF00"
                                }
                                variant="outline"
                                className="group"
                              >
                                Lire la suite
                                <svg
                                  className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                  />
                                </svg>
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )}

              {/* Bouton "Voir plus" */}
              {articles.length > 3 && !showAllArticles && (
                <div className="text-center pt-12">
                  <Button
                    onClick={() => setShowAllArticles(true)}
                    primaryColor={tenant?.primary_color || "#00AF00"}
                    size="lg"
                    className="px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    Voir plus d'actualités ({articles.length - 3} autres)
                  </Button>
                </div>
              )}

              {/* Bouton "Voir moins" */}
              {showAllArticles && articles.length > 3 && (
                <div className="text-center pt-12">
                  <Button
                    onClick={() => setShowAllArticles(false)}
                    variant="outline"
                    primaryColor={tenant?.primary_color || "#00AF00"}
                    size="lg"
                    className="px-8 py-4 text-lg font-semibold border-2 hover:bg-gray-50 transition-all duration-300"
                  >
                    Voir moins
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Footer moderne */}
      <footer className="bg-white border-t border-gray-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Logo et nom */}
            <div className="mb-8">
              <div className="flex items-center justify-center mb-4">
                <h3
                  className="text-2xl font-bold"
                  style={{ color: tenant?.primary_color || "#00AF00" }}
                >
                  {tenant?.nom}
                </h3>
              </div>
            </div>

            {/* Contact */}
            {(tenant?.email_contact ||
              tenant?.telephone_contact ||
              tenant?.adresse_contact ||
              tenant?.lien_instagram) && (
              <div className="mb-8 flex flex-wrap justify-center gap-6">
                {tenant?.email_contact && (
                  <a
                    href={`mailto:${tenant.email_contact}`}
                    className="text-gray-600 hover:text-gray-900 transition-colors flex items-center space-x-2"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <span>{tenant.email_contact}</span>
                  </a>
                )}
                {tenant?.telephone_contact && (
                  <a
                    href={`tel:${tenant.telephone_contact}`}
                    className="text-gray-600 hover:text-gray-900 transition-colors flex items-center space-x-2"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    <span>{tenant.telephone_contact}</span>
                  </a>
                )}
                {tenant?.adresse_contact && (
                  <span className="text-gray-600 flex items-center space-x-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <span>{tenant.adresse_contact}</span>
                  </span>
                )}
                {tenant?.lien_instagram && (
                  <a
                    href={tenant.lien_instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                )}
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 pt-8 text-center">
            <p className="text-gray-500 mb-6">
              Gestion des événements et participations avec Membora
            </p>
            <Link href="/auth/login">
              <Button
                primaryColor={tenant?.primary_color || "#00AF00"}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Accéder à l'espace membre
              </Button>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
