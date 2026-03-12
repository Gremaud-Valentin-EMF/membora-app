const pool = require("../config/db");

const badgeService = {
  // Gestion des badges système
  async getAllBadges(tenant_id) {
    const result = await pool.query(
      `SELECT bs.*, 
              COUNT(ba.id) as membres_count
       FROM badges_system bs
       LEFT JOIN badges_attribution ba ON bs.id = ba.badge_id
       WHERE bs.tenant_id = $1
       GROUP BY bs.id
       ORDER BY bs.created_at DESC`,
      [tenant_id]
    );
    return result.rows;
  },

  async getBadgeById(id, tenant_id) {
    const result = await pool.query(
      `SELECT * FROM badges_system 
       WHERE id = $1 AND tenant_id = $2`,
      [id, tenant_id]
    );
    return result.rows[0];
  },

  async createBadge({ nom, description, icone, couleur, tenant_id }) {
    const result = await pool.query(
      `INSERT INTO badges_system (nom, description, icone, couleur, tenant_id)
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [nom, description, icone, couleur, tenant_id]
    );
    return result.rows[0];
  },

  async updateBadge(id, data, tenant_id) {
    const fields = Object.keys(data);
    const values = Object.values(data);

    if (fields.length === 0) {
      return this.getBadgeById(id, tenant_id);
    }

    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(", ");
    const result = await pool.query(
      `UPDATE badges_system SET ${setClause} 
       WHERE id = $${fields.length + 1} AND tenant_id = $${fields.length + 2} 
       RETURNING *`,
      [...values, id, tenant_id]
    );
    return result.rows[0];
  },

  async deleteBadge(id, tenant_id) {
    // Supprimer d'abord les attributions
    await pool.query(
      `DELETE FROM badges_attribution ba
       USING badges_system bs
       WHERE ba.badge_id = bs.id AND bs.id = $1 AND bs.tenant_id = $2`,
      [id, tenant_id]
    );

    // Puis supprimer le badge
    await pool.query(
      `DELETE FROM badges_system WHERE id = $1 AND tenant_id = $2`,
      [id, tenant_id]
    );
  },

  // Gestion des attributions
  async getBadgeAttributions(badge_id, tenant_id) {
    const result = await pool.query(
      `SELECT ba.*, m.nom, m.prenom, m.email, m.role
       FROM badges_attribution ba
       JOIN membres m ON ba.membre_id = m.id
       JOIN badges_system bs ON ba.badge_id = bs.id
       WHERE ba.badge_id = $1 AND bs.tenant_id = $2
       ORDER BY ba.date_attribution DESC`,
      [badge_id, tenant_id]
    );
    return result.rows;
  },

  async attribuerBadge(badge_id, membre_id, attribue_par, tenant_id) {
    // Vérifier que le badge et le membre appartiennent au même tenant
    const badgeCheck = await pool.query(
      `SELECT id FROM badges_system WHERE id = $1 AND tenant_id = $2`,
      [badge_id, tenant_id]
    );

    if (badgeCheck.rows.length === 0) {
      throw new Error("Badge non trouvé");
    }

    const membreCheck = await pool.query(
      `SELECT id FROM membres WHERE id = $1 AND tenant_id = $2`,
      [membre_id, tenant_id]
    );

    if (membreCheck.rows.length === 0) {
      throw new Error("Membre non trouvé");
    }

    // Vérifier si l'attribution existe déjà
    const existingAttribution = await pool.query(
      `SELECT id FROM badges_attribution WHERE badge_id = $1 AND membre_id = $2`,
      [badge_id, membre_id]
    );

    if (existingAttribution.rows.length > 0) {
      throw new Error("Ce badge est déjà attribué à ce membre");
    }

    // Créer l'attribution
    const result = await pool.query(
      `INSERT INTO badges_attribution (badge_id, membre_id, attribue_par)
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [badge_id, membre_id, attribue_par]
    );

    return result.rows[0];
  },

  async retirerAttribution(attribution_id, tenant_id) {
    const result = await pool.query(
      `DELETE FROM badges_attribution ba
       USING badges_system bs
       WHERE ba.badge_id = bs.id AND ba.id = $1 AND bs.tenant_id = $2
       RETURNING ba.id`,
      [attribution_id, tenant_id]
    );

    if (result.rows.length === 0) {
      throw new Error("Attribution non trouvée");
    }
  },

  // Méthodes utilitaires
  async getMembreBadges(membre_id, tenant_id) {
    const result = await pool.query(
      `SELECT bs.*, ba.date_attribution, ba.attribue_par
       FROM badges_attribution ba
       JOIN badges_system bs ON ba.badge_id = bs.id
       JOIN membres m ON ba.membre_id = m.id
       WHERE ba.membre_id = $1 AND m.tenant_id = $2
       ORDER BY ba.date_attribution DESC`,
      [membre_id, tenant_id]
    );
    return result.rows;
  },
};

module.exports = badgeService;
