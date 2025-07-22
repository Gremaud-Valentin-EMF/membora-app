-- Refactor presence system: drop participations and add new tables
DROP TABLE IF EXISTS participations;

CREATE TABLE IF NOT EXISTS tranches_horaires (
    id serial PRIMARY KEY,
    evenement_id integer NOT NULL REFERENCES evenements(id) ON DELETE CASCADE,
    debut timestamp NOT NULL,
    fin timestamp NOT NULL,
    valeur_coches integer NOT NULL DEFAULT 0,
    badge_categorie varchar(255),
    tenant_id integer NOT NULL REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS inscriptions_tranches (
    id serial PRIMARY KEY,
    tranche_id integer NOT NULL REFERENCES tranches_horaires(id) ON DELETE CASCADE,
    membre_id integer NOT NULL REFERENCES membres(id) ON DELETE CASCADE,
    coche_attribue boolean DEFAULT false,
    created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS badges (
    id serial PRIMARY KEY,
    membre_id integer NOT NULL REFERENCES membres(id) ON DELETE CASCADE,
    categorie varchar(255) NOT NULL,
    created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);
