-- Script de migration pour corriger la base de données existante
-- Ce script corrige les problèmes sans perdre les données
-- Version finale qui gère les contraintes existantes

BEGIN;

-- 1. Vérifier et corriger la contrainte de statut pour les événements
-- D'abord, supprimer la contrainte existante si elle existe
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conrelid = 'evenements'::regclass 
        AND conname = 'evenements_statut_check'
    ) THEN
        ALTER TABLE evenements DROP CONSTRAINT evenements_statut_check;
    END IF;
END $$;

-- Puis ajouter la nouvelle contrainte avec les bonnes valeurs
ALTER TABLE evenements 
ADD CONSTRAINT evenements_statut_check 
CHECK (statut IN ('planifié', 'en cours', 'terminé', 'annulé'));

-- 2. Changer le type de la colonne date de DATE à TIMESTAMP pour supporter les heures
-- D'abord, créer une colonne temporaire
ALTER TABLE evenements ADD COLUMN date_temp TIMESTAMP;

-- Convertir les dates existantes en timestamp (ajouter 00:00:00 si pas d'heure)
UPDATE evenements SET date_temp = date::timestamp;

-- Supprimer l'ancienne colonne et renommer la nouvelle
ALTER TABLE evenements DROP COLUMN date;
ALTER TABLE evenements RENAME COLUMN date_temp TO date;

-- 3. Ajouter la colonne createur_id à evenements si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'evenements' AND column_name = 'createur_id') THEN
        ALTER TABLE evenements ADD COLUMN createur_id INTEGER REFERENCES membres(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 4. Ajouter la colonne status à membres si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'membres' AND column_name = 'status') THEN
        ALTER TABLE membres ADD COLUMN status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('pending', 'active', 'rejected'));
    END IF;
END $$;

-- 5. Ajouter la colonne created_at à membres si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'membres' AND column_name = 'created_at') THEN
        ALTER TABLE membres ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- 6. Ajouter la colonne created_at à evenements si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'evenements' AND column_name = 'created_at') THEN
        ALTER TABLE evenements ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- 7. Ajouter la colonne created_at à participations si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'participations' AND column_name = 'created_at') THEN
        ALTER TABLE participations ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- 8. Ajouter la colonne created_at à categories si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'created_at') THEN
        ALTER TABLE categories ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- 9. Ajouter la colonne created_at à articles si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'created_at') THEN
        ALTER TABLE articles ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- 10. Changer le type de date_publication de DATE à TIMESTAMP pour les articles
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'date_publication' AND data_type = 'date') THEN
        ALTER TABLE articles ADD COLUMN date_publication_temp TIMESTAMP;
        UPDATE articles SET date_publication_temp = date_publication::timestamp;
        ALTER TABLE articles DROP COLUMN date_publication;
        ALTER TABLE articles RENAME COLUMN date_publication_temp TO date_publication;
    END IF;
END $$;

-- 11. Ajouter des index manquants pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_membres_tenant ON membres(tenant_id);
CREATE INDEX IF NOT EXISTS idx_categories_tenant ON categories(tenant_id);
CREATE INDEX IF NOT EXISTS idx_evenements_tenant ON evenements(tenant_id);
CREATE INDEX IF NOT EXISTS idx_evenements_date ON evenements(date);
CREATE INDEX IF NOT EXISTS idx_participations_tenant ON participations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_articles_tenant ON articles(tenant_id);

-- 12. Ajouter la table permissions si elle n'existe pas
CREATE TABLE IF NOT EXISTS permissions (
  membre_id INTEGER NOT NULL REFERENCES membres(id) ON DELETE CASCADE,
  categorie_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  tenant_id INTEGER NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  PRIMARY KEY (membre_id, categorie_id)
);

-- 13. Ajouter des contraintes de validation pour les rôles (si elles n'existent pas)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conrelid = 'membres'::regclass 
        AND conname = 'membres_role_check'
    ) THEN
        ALTER TABLE membres 
        ADD CONSTRAINT membres_role_check 
        CHECK (role IN ('membre', 'responsable', 'sous-admin'));
    END IF;
END $$;

-- 14. Ajouter des contraintes de validation pour les états d'articles (si elles n'existent pas)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conrelid = 'articles'::regclass 
        AND conname = 'articles_etat_check'
    ) THEN
        ALTER TABLE articles 
        ADD CONSTRAINT articles_etat_check 
        CHECK (etat IN ('brouillon', 'publié', 'archivé'));
    END IF;
END $$;

-- 15. Mettre à jour les valeurs par défaut pour les colonnes existantes
-- Si des colonnes created_at sont NULL, les mettre à CURRENT_TIMESTAMP
UPDATE membres SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL;
UPDATE evenements SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL;
UPDATE participations SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL;
UPDATE categories SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL;
UPDATE articles SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL;

-- 16. S'assurer que les colonnes created_at ne sont pas NULL (seulement si elles existent)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'membres' AND column_name = 'created_at') THEN
        ALTER TABLE membres ALTER COLUMN created_at SET NOT NULL;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'evenements' AND column_name = 'created_at') THEN
        ALTER TABLE evenements ALTER COLUMN created_at SET NOT NULL;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'participations' AND column_name = 'created_at') THEN
        ALTER TABLE participations ALTER COLUMN created_at SET NOT NULL;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'created_at') THEN
        ALTER TABLE categories ALTER COLUMN created_at SET NOT NULL;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'created_at') THEN
        ALTER TABLE articles ALTER COLUMN created_at SET NOT NULL;
    END IF;
END $$;

COMMIT;

-- Vérification des corrections
DO $$
BEGIN
    RAISE NOTICE 'Migration terminée avec succès!';
    RAISE NOTICE 'Vérifications:';
    RAISE NOTICE '- Contrainte de statut mise à jour pour evenements';
    RAISE NOTICE '- Colonne date changée en TIMESTAMP';
    RAISE NOTICE '- Colonnes created_at ajoutées';
    RAISE NOTICE '- Index de performance créés';
    RAISE NOTICE '- Contraintes de validation ajoutées';
END $$; 