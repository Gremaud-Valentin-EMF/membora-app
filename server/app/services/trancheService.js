const pool = require("../config/db");

const trancheService = {
  // Gestion des tranches horaires
  async getAllTranches(tenant_id) {
    const result = await pool.query(
      `SELECT th.*, 
              th.debut as date_debut,
              th.fin as date_fin,
              th.secteur as secteur_nom,
              th.max_participants as participants_necessaires,
              e.nom as evenement_nom,
              e.statut as evenement_statut,
              COUNT(CASE WHEN e.statut != 'annulé' THEN it.id END) as participants_inscrits
       FROM tranches_horaires th
       LEFT JOIN evenements e ON th.evenement_id = e.id
       LEFT JOIN inscriptions_tranches it ON th.id = it.tranche_id
       WHERE th.tenant_id = $1
       GROUP BY th.id, e.nom, e.statut, th.debut, th.fin, th.secteur, th.max_participants
       ORDER BY th.debut ASC`,
      [tenant_id]
    );
    return result.rows;
  },

  async getTrancheById(id, tenant_id) {
    const result = await pool.query(
      `SELECT th.*, 
              th.debut as date_debut,
              th.fin as date_fin,
              th.secteur as secteur_nom,
              th.max_participants as participants_necessaires,
              e.nom as evenement_nom,
              e.statut as evenement_statut,
              COUNT(CASE WHEN e.statut != 'annulé' THEN it.id END) as participants_inscrits
       FROM tranches_horaires th
       LEFT JOIN evenements e ON th.evenement_id = e.id
       LEFT JOIN inscriptions_tranches it ON th.id = it.tranche_id
       WHERE th.id = $1 AND th.tenant_id = $2
       GROUP BY th.id, e.nom, e.statut, th.debut, th.fin, th.secteur, th.max_participants`,
      [id, tenant_id]
    );
    return result.rows[0];
  },

  async createTranche({
    evenement_id,
    nom,
    debut,
    fin,
    valeur_coches,
    max_participants,
    description,
    secteur,
    couleur,
    tenant_id,
  }) {
    // Vérifier que l'événement appartient au tenant
    const eventCheck = await pool.query(
      `SELECT id FROM evenements WHERE id = $1 AND tenant_id = $2`,
      [evenement_id, tenant_id]
    );

    if (eventCheck.rows.length === 0) {
      throw new Error("Événement non trouvé");
    }

    const result = await pool.query(
      `INSERT INTO tranches_horaires (evenement_id, nom, debut, fin, valeur_coches, max_participants, description, secteur, couleur, tenant_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
       RETURNING *`,
      [
        evenement_id,
        nom,
        debut,
        fin,
        valeur_coches || 1,
        max_participants,
        description,
        secteur,
        couleur || "#3B82F6",
        tenant_id,
      ]
    );
    return result.rows[0];
  },

  async updateTranche(id, data, tenant_id) {
    const fields = Object.keys(data);
    const values = Object.values(data);

    if (fields.length === 0) {
      return this.getTrancheById(id, tenant_id);
    }

    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(", ");
    const result = await pool.query(
      `UPDATE tranches_horaires SET ${setClause} 
       WHERE id = $${fields.length + 1} AND tenant_id = $${fields.length + 2} 
       RETURNING *`,
      [...values, id, tenant_id]
    );
    return result.rows[0];
  },

  async deleteTranche(id, tenant_id) {
    // Supprimer d'abord les inscriptions
    await pool.query(
      `DELETE FROM inscriptions_tranches it
       USING tranches_horaires th
       WHERE it.tranche_id = th.id AND th.id = $1 AND th.tenant_id = $2`,
      [id, tenant_id]
    );

    // Puis supprimer la tranche
    await pool.query(
      `DELETE FROM tranches_horaires WHERE id = $1 AND tenant_id = $2`,
      [id, tenant_id]
    );
  },

  // Gestion des inscriptions
  async getTrancheInscriptions(tranche_id, tenant_id) {
    const result = await pool.query(
      `SELECT it.*, m.nom, m.prenom, m.email, m.role
       FROM inscriptions_tranches it
       JOIN membres m ON it.membre_id = m.id
       JOIN tranches_horaires th ON it.tranche_id = th.id
       WHERE it.tranche_id = $1 AND th.tenant_id = $2
       ORDER BY it.created_at ASC`,
      [tranche_id, tenant_id]
    );
    return result.rows;
  },

  async inscrireMembre(tranche_id, membre_id, tenant_id) {
    // Vérifier que la tranche et le membre appartiennent au même tenant
    const trancheCheck = await pool.query(
      `SELECT th.id, th.max_participants, e.statut, e.nom as evenement_nom
       FROM tranches_horaires th
       JOIN evenements e ON th.evenement_id = e.id
       WHERE th.id = $1 AND th.tenant_id = $2`,
      [tranche_id, tenant_id]
    );

    if (trancheCheck.rows.length === 0) {
      throw new Error("Tranche horaire non trouvée");
    }

    // Vérifier que l'événement n'est pas annulé
    if (trancheCheck.rows[0].statut === "annulé") {
      throw new Error(
        `Impossible de s'inscrire : l'événement "${trancheCheck.rows[0].evenement_nom}" est annulé`
      );
    }

    const membreCheck = await pool.query(
      `SELECT id FROM membres WHERE id = $1 AND tenant_id = $2`,
      [membre_id, tenant_id]
    );

    if (membreCheck.rows.length === 0) {
      throw new Error("Membre non trouvé");
    }

    // Vérifier si l'inscription existe déjà
    const existingInscription = await pool.query(
      `SELECT id FROM inscriptions_tranches WHERE tranche_id = $1 AND membre_id = $2`,
      [tranche_id, membre_id]
    );

    if (existingInscription.rows.length > 0) {
      throw new Error("Ce membre est déjà inscrit à cette tranche horaire");
    }

    // Vérifier si la tranche est complète (seulement si l'événement n'est pas annulé)
    const currentParticipants = await pool.query(
      `SELECT COUNT(*) as count FROM inscriptions_tranches WHERE tranche_id = $1`,
      [tranche_id]
    );

    const maxParticipants = trancheCheck.rows[0].max_participants;
    if (
      maxParticipants &&
      currentParticipants.rows[0].count >= maxParticipants
    ) {
      throw new Error("Cette tranche horaire est complète");
    }

    // Créer l'inscription
    const result = await pool.query(
      `INSERT INTO inscriptions_tranches (tranche_id, membre_id)
       VALUES ($1, $2) 
       RETURNING *`,
      [tranche_id, membre_id]
    );

    return result.rows[0];
  },

  async desinscrireMembre(inscription_id, tenant_id) {
    const result = await pool.query(
      `DELETE FROM inscriptions_tranches it
       USING tranches_horaires th
       WHERE it.tranche_id = th.id AND it.id = $1 AND th.tenant_id = $2
       RETURNING it.id`,
      [inscription_id, tenant_id]
    );

    if (result.rows.length === 0) {
      throw new Error("Inscription non trouvée");
    }
  },

  // Routes spéciales
  async getTranchesByEvenement(evenement_id, tenant_id) {
    const result = await pool.query(
      `SELECT th.*, 
              th.debut as date_debut,
              th.fin as date_fin,
              th.secteur as secteur_nom,
              th.max_participants as participants_necessaires,
              e.statut as evenement_statut,
              COUNT(CASE WHEN e.statut != 'annulé' THEN it.id END) as participants_inscrits
       FROM tranches_horaires th
       LEFT JOIN inscriptions_tranches it ON th.id = it.tranche_id
       LEFT JOIN evenements e ON th.evenement_id = e.id
       WHERE th.evenement_id = $1 AND th.tenant_id = $2
       GROUP BY th.id, th.debut, th.fin, th.secteur, th.max_participants, e.statut
       ORDER BY th.debut ASC`,
      [evenement_id, tenant_id]
    );
    return result.rows;
  },

  // Méthodes utilitaires
  async getMembreInscriptions(membre_id, tenant_id) {
    const result = await pool.query(
      `SELECT it.*, 
              th.nom as tranche_nom, 
              th.debut as date_debut, 
              th.fin as date_fin, 
              th.secteur as secteur_nom, 
              th.max_participants as participants_necessaires,
              th.couleur,
              e.nom as evenement_nom
       FROM inscriptions_tranches it
       JOIN tranches_horaires th ON it.tranche_id = th.id
       JOIN evenements e ON th.evenement_id = e.id
       JOIN membres m ON it.membre_id = m.id
       WHERE it.membre_id = $1 AND m.tenant_id = $2
       ORDER BY th.debut ASC`,
      [membre_id, tenant_id]
    );
    return result.rows;
  },

  async getMembreInscriptionsByEvenement(evenement_id, membre_id, tenant_id) {
    const result = await pool.query(
      `SELECT it.*, 
              th.nom as tranche_nom, 
              th.debut as date_debut, 
              th.fin as date_fin, 
              th.secteur as secteur_nom, 
              th.max_participants as participants_necessaires,
              th.couleur,
              e.nom as evenement_nom
       FROM inscriptions_tranches it
       JOIN tranches_horaires th ON it.tranche_id = th.id
       JOIN evenements e ON th.evenement_id = e.id
       JOIN membres m ON it.membre_id = m.id
       WHERE it.membre_id = $1 AND th.evenement_id = $2 AND m.tenant_id = $3
       ORDER BY th.debut ASC`,
      [membre_id, evenement_id, tenant_id]
    );
    return result.rows;
  },
};

module.exports = trancheService;
