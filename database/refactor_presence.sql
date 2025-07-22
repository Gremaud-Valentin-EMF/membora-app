BEGIN;

-- Remove legacy presence system
DROP TABLE IF EXISTS coche_history CASCADE;
DROP TABLE IF EXISTS logs_presence CASCADE;
DROP TABLE IF EXISTS demandes_exception CASCADE;
DROP TABLE IF EXISTS presences CASCADE;
DROP TABLE IF EXISTS time_slots CASCADE;
DROP TABLE IF EXISTS participations CASCADE;

-- Adapt tranches_horaires to new structure
ALTER TABLE tranches_horaires
    RENAME COLUMN coche TO valeur_coches;
ALTER TABLE tranches_horaires
    DROP COLUMN IF EXISTS nom,
    DROP COLUMN IF EXISTS places_max;
ALTER TABLE tranches_horaires
    ADD COLUMN IF NOT EXISTS badge_categorie varchar(255);

-- New table for inscriptions
CREATE TABLE IF NOT EXISTS inscriptions_tranches (
    id serial PRIMARY KEY,
    tranche_id integer NOT NULL REFERENCES tranches_horaires(id) ON DELETE CASCADE,
    membre_id integer NOT NULL REFERENCES membres(id) ON DELETE CASCADE,
    coche_attribue boolean NOT NULL DEFAULT false,
    created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Simplified badges table
DROP TABLE IF EXISTS badges CASCADE;
CREATE TABLE badges (
    id serial PRIMARY KEY,
    membre_id integer NOT NULL REFERENCES membres(id) ON DELETE CASCADE,
    categorie varchar(255) NOT NULL,
    created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP
);

END;
