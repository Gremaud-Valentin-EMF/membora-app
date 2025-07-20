-- Script pour corriger la contrainte de statut des événements
-- Supprimer l'ancienne contrainte si elle existe
ALTER TABLE evenements DROP CONSTRAINT IF EXISTS evenements_statut_check;

-- Ajouter la nouvelle contrainte avec les valeurs correctes
ALTER TABLE evenements ADD CONSTRAINT evenements_statut_check 
CHECK (statut IN ('planifié', 'en cours', 'terminé', 'annulé'));