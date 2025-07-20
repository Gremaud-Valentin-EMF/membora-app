-- Script pour ajouter des slugs aux tenants existants et créer des exemples

-- Mettre à jour le tenant existant (ID 6 - "Jeunesse du Pâquier")
UPDATE tenants 
SET slug = 'jeunesse-le-paquier' 
WHERE id = 6;

-- Créer quelques tenants d'exemple pour tester le multi-tenant
INSERT INTO tenants (nom, logo_url, primary_color, secondary_color, slug, created_at) VALUES
('Jeunesse de Bulle', 'https://via.placeholder.com/150x150/FF6B6B/FFFFFF?text=JB', '#FF6B6B', '#4ECDC4', 'jeunesse-bulle', NOW()),
('Jeunesse de Fribourg', 'https://via.placeholder.com/150x150/45B7D1/FFFFFF?text=JF', '#45B7D1', '#96CEB4', 'jeunesse-fribourg', NOW()),
('Jeunesse de Gruyères', 'https://via.placeholder.com/150x150/FFEAA7/333333?text=JG', '#FFEAA7', '#DDA0DD', 'jeunesse-de-gruyere', NOW()),
('Jeunesse de Vevey', 'https://via.placeholder.com/150x150/55A3FF/FFFFFF?text=JV', '#55A3FF', '#FFB6C1', 'jeunesse-vevey', NOW());

-- Afficher les tenants créés
SELECT id, nom, slug, primary_color FROM tenants ORDER BY id; 