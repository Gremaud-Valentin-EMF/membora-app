"use client";

import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import Button from "../ui/Button";
import Link from "next/link";
import Image from "next/image";

const Navbar = () => {
  const { user, tenant, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [viewMode, setViewMode] = useState("admin"); // 'admin' ou 'member'

  if (!user || !tenant) return null;

  // Déterminer si l'utilisateur peut basculer entre les vues
  const canSwitchView =
    user.role === "sous-admin" || user.role === "responsable";

  // Déterminer la vue actuelle basée sur le rôle
  const currentView = canSwitchView ? viewMode : "member";

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleView = () => {
    setViewMode(viewMode === "admin" ? "member" : "admin");
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo et nom */}
          <div className="flex items-center space-x-4">
            {tenant.logo_url && (
              <Image
                src={tenant.logo_url}
                alt={`Logo ${tenant.nom}`}
                width={40}
                height={40}
                className="rounded-lg"
              />
            )}
            <span className="text-xl font-semibold text-gray-900">
              {tenant.nom}
            </span>
            {canSwitchView && (
              <div className="flex items-center space-x-2 ml-4">
                <span className="text-sm text-gray-500">Vue:</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleView}
                  primaryColor={tenant.primary_color}
                >
                  {currentView === "admin" ? "Administration" : "Membre"}
                </Button>
              </div>
            )}
          </div>

          {/* Navigation desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Navigation selon la vue */}
            {currentView === "admin" &&
              (user.role === "responsable" || user.role === "sous-admin") && (
                <>
                  <Link href="/main/dashboard">
                    <Button variant="ghost" size="sm">
                      Dashboard
                    </Button>
                  </Link>
                  <Link href="/main/events">
                    <Button variant="ghost" size="sm">
                      Événements
                    </Button>
                  </Link>
                  <Link href="/main/events/create">
                    <Button variant="ghost" size="sm">
                      Créer événement
                    </Button>
                  </Link>
                  <Link href="/main/attendance">
                    <Button variant="ghost" size="sm">
                      Marquer présences
                    </Button>
                  </Link>
                  {user.role === "sous-admin" && (
                    <>
                      <Link href="/main/members">
                        <Button variant="ghost" size="sm">
                          Membres
                        </Button>
                      </Link>
                      <Link href="/main/categories">
                        <Button variant="ghost" size="sm">
                          Catégories
                        </Button>
                      </Link>
                    </>
                  )}
                </>
              )}

            {currentView === "member" && (
              <>
                <Link href="/main/events">
                  <Button variant="ghost" size="sm">
                    Événements
                  </Button>
                </Link>
                <Link href="/main/profile">
                  <Button variant="ghost" size="sm">
                    Mon profil
                  </Button>
                </Link>
              </>
            )}

            {/* Menu utilisateur */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMenu}
                className="flex items-center space-x-1"
              >
                <span>{user.nom}</span>
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
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </Button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b">
                    <div className="font-medium">{user.nom}</div>
                    <div className="text-gray-500">{user.email}</div>
                    <div className="text-gray-500 capitalize">{user.role}</div>
                  </div>
                  <Link href="/main/profile">
                    <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Mon profil
                    </button>
                  </Link>
                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Bouton menu mobile */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={toggleMenu}>
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </Button>
          </div>
        </div>

        {/* Menu mobile */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            {/* Navigation selon la vue */}
            {currentView === "admin" &&
              (user.role === "responsable" || user.role === "sous-admin") && (
                <div className="space-y-2">
                  <Link href="/main/dashboard">
                    <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Dashboard
                    </button>
                  </Link>
                  <Link href="/main/events">
                    <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Événements
                    </button>
                  </Link>
                  <Link href="/main/events/create">
                    <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Créer événement
                    </button>
                  </Link>
                  <Link href="/main/attendance">
                    <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Marquer présences
                    </button>
                  </Link>
                  {user.role === "sous-admin" && (
                    <>
                      <Link href="/main/members">
                        <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Membres
                        </button>
                      </Link>
                      <Link href="/main/categories">
                        <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Catégories
                        </button>
                      </Link>
                    </>
                  )}
                </div>
              )}

            {currentView === "member" && (
              <div className="space-y-2">
                <Link href="/main/events">
                  <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Événements
                  </button>
                </Link>
                <Link href="/main/profile">
                  <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Mon profil
                  </button>
                </Link>
              </div>
            )}

            {/* Basculement de vue pour mobile */}
            {canSwitchView && (
              <div className="border-t border-gray-200 pt-2 mt-2">
                <button
                  onClick={toggleView}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Basculer vers{" "}
                  {currentView === "admin"
                    ? "vue membre"
                    : "vue administration"}
                </button>
              </div>
            )}

            {/* Déconnexion mobile */}
            <div className="border-t border-gray-200 pt-2 mt-2">
              <button
                onClick={logout}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Déconnexion
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
