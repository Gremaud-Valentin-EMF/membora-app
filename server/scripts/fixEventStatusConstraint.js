require("dotenv").config();
const pool = require("../app/config/db");

async function fixEventStatusConstraint() {
  try {
    console.log("Correction de la contrainte de statut des événements...");

    // Supprimer l'ancienne contrainte si elle existe
    await pool.query(`
      ALTER TABLE evenements DROP CONSTRAINT IF EXISTS evenements_statut_check;
    `);

    // Ajouter la nouvelle contrainte avec les valeurs correctes
    await pool.query(`
      ALTER TABLE evenements ADD CONSTRAINT evenements_statut_check 
      CHECK (statut IN ('planifié', 'en cours', 'terminé', 'annulé'));
    `);

    console.log("✅ Contrainte de statut corrigée avec succès");
  } catch (error) {
    console.error(
      "❌ Erreur lors de la correction de la contrainte:",
      error.message
    );
  } finally {
    await pool.end();
  }
}

fixEventStatusConstraint();
