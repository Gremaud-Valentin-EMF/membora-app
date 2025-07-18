-- Script pour vérifier la contrainte de statut existante
-- Exécutez ce script pour voir quelle est la contrainte actuelle

-- 1. Voir la définition de la contrainte existante
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'evenements'::regclass 
AND conname = 'evenements_statut_check';

-- 2. Voir les valeurs actuelles dans la colonne statut
SELECT DISTINCT statut, COUNT(*) as nombre
FROM evenements 
GROUP BY statut
ORDER BY statut;

-- 3. Voir la structure de la table evenements
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'evenements' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Tester l'insertion d'un événement avec statut "planifié"
-- (Cette requête ne sera pas exécutée, c'est juste pour vérification)
-- INSERT INTO evenements (nom, date, categorie_id, statut, tenant_id) 
-- VALUES ('Test événement', '2024-01-01 14:30:00', 1, 'planifié', 1); 