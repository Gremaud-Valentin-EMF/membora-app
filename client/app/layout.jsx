import "./globals.css";
import { Inter } from "next/font/google";
import DynamicFavicon from "../components/shared/DynamicFavicon";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Membora",
  description:
    "Application de gestion des présences pour les organisations de jeunesse",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head></head>
      <body className={inter.className}>
        <DynamicFavicon />
        {children}
      </body>
    </html>
  );
}
