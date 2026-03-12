-- Table pour les inscriptions directes aux événements sociaux
CREATE TABLE IF NOT EXISTS evenements_inscriptions (
    id SERIAL PRIMARY KEY,
    evenement_id INTEGER NOT NULL REFERENCES evenements(id) ON DELETE CASCADE,
    membre_id INTEGER NOT NULL REFERENCES membres(id) ON DELETE CASCADE,
    date_inscription TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Contrainte unique pour éviter les doublons
    UNIQUE(evenement_id, membre_id)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_evenements_inscriptions_evenement_id ON evenements_inscriptions(evenement_id);
CREATE INDEX IF NOT EXISTS idx_evenements_inscriptions_membre_id ON evenements_inscriptions(membre_id);
CREATE INDEX IF NOT EXISTS idx_evenements_inscriptions_date_inscription ON evenements_inscriptions(date_inscription);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_evenements_inscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_evenements_inscriptions_updated_at
    BEFORE UPDATE ON evenements_inscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_evenements_inscriptions_updated_at();

-- Données de test pour tenant_id = 6 (optionnel)
-- INSERT INTO evenements_inscriptions (evenement_id, membre_id) VALUES 
-- (1, 1), -- Exemple d'inscription
-- (1, 2); -- Exemple d'inscription 