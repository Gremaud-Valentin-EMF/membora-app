const pool = require("../config/db");

const evenementService = {
  async getAll(tenant_id = null) {
    let query = `
      SELECT e.*, 
             TO_CHAR(e.date, 'YYYY-MM-DD"T"HH24:MI:SS') as date_formatted,
             TO_CHAR(e.date_fin, 'YYYY-MM-DD"T"HH24:MI:SS') as date_fin_formatted,
             c.nom as categorie_nom,
             ec.nom as event_category_nom,
             m.nom as createur_nom,
             m.prenom as createur_prenom,
             r.nom as responsable_nom,
             r.prenom as responsable_prenom
      FROM evenements e
      LEFT JOIN categories c ON e.categorie_id = c.id
      LEFT JOIN event_categories ec ON e.event_category_id = ec.id
      LEFT JOIN membres m ON e.createur_id = m.id
      LEFT JOIN membres r ON e.responsable_id = r.id
    `;

    const params = [];
    if (tenant_id) {
      query += ` WHERE e.tenant_id = $1`;
      params.push(tenant_id);
    }

    query += ` ORDER BY e.date DESC`;

    const result = await pool.query(query, params);
    return result.rows;
  },

  async getById(id, tenant_id = null) {
    let query = `
      SELECT e.*, 
             TO_CHAR(e.date, 'YYYY-MM-DD"T"HH24:MI:SS') as date_formatted,
             TO_CHAR(e.date_fin, 'YYYY-MM-DD"T"HH24:MI:SS') as date_fin_formatted,
             c.nom as categorie_nom,
             ec.nom as event_category_nom,
             m.nom as createur_nom,
             m.prenom as createur_prenom,
             r.nom as responsable_nom,
             r.prenom as responsable_prenom
      FROM evenements e
      LEFT JOIN categories c ON e.categorie_id = c.id
      LEFT JOIN event_categories ec ON e.event_category_id = ec.id
      LEFT JOIN membres m ON e.createur_id = m.id
      LEFT JOIN membres r ON e.responsable_id = r.id
      WHERE e.id = $1
    `;

    const params = [id];
    if (tenant_id) {
      query += ` AND e.tenant_id = $2`;
      params.push(tenant_id);
    }

    const result = await pool.query(query, params);
    return result.rows[0];
  },

  async create({
    nom,
    date,
    date_fin,
    categorie_id,
    event_category_id,
    statut,
    tenant_id,
    createur_id,
    responsable_id,
    description,
    lieu,
    badges_requis,
    has_planning,
  }) {
    const result = await pool.query(
      `INSERT INTO evenements (nom, date, date_fin, categorie_id, event_category_id, statut, tenant_id, createur_id, responsable_id, description, lieu, badges_requis, has_planning)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
       RETURNING *, TO_CHAR(date, 'YYYY-MM-DD"T"HH24:MI:SS') as date_formatted, TO_CHAR(date_fin, 'YYYY-MM-DD"T"HH24:MI:SS') as date_fin_formatted`,
      [
        nom,
        date,
        date_fin,
        categorie_id,
        event_category_id,
        statut,
        tenant_id,
        createur_id,
        responsable_id,
        description,
        lieu,
        badges_requis,
        has_planning,
      ]
    );
    return result.rows[0];
  },

  async update(id, data, tenant_id = null) {
    const fields = Object.keys(data);
    const values = Object.values(data);

    if (fields.length === 0) {
      return this.getById(id, tenant_id);
    }

    let query = `UPDATE evenements SET ${fields
      .map((f, i) => `${f} = $${i + 1}`)
      .join(", ")} WHERE id = $${fields.length + 1}`;
    const params = [...values, id];

    if (tenant_id) {
      query += ` AND tenant_id = $${fields.length + 2}`;
      params.push(tenant_id);
    }

    query += ` RETURNING *, TO_CHAR(date, 'YYYY-MM-DD"T"HH24:MI:SS') as date_formatted, TO_CHAR(date_fin, 'YYYY-MM-DD"T"HH24:MI:SS') as date_fin_formatted`;

    const result = await pool.query(query, params);
    return result.rows[0];
  },

  async delete(id, tenant_id = null) {
    let query = "DELETE FROM evenements WHERE id = $1";
    const params = [id];

    if (tenant_id) {
      query += ` AND tenant_id = $2`;
      params.push(tenant_id);
    }

    await pool.query(query, params);
  },

  async getByCategorie(categorie_id, tenant_id = null) {
    let query = `
      SELECT e.*, 
             TO_CHAR(e.date, 'YYYY-MM-DD"T"HH24:MI:SS') as date_formatted,
             TO_CHAR(e.date_fin, 'YYYY-MM-DD"T"HH24:MI:SS') as date_fin_formatted,
             c.nom as categorie_nom,
             ec.nom as event_category_nom
      FROM evenements e
      LEFT JOIN categories c ON e.categorie_id = c.id
      LEFT JOIN event_categories ec ON e.event_category_id = ec.id
      WHERE e.categorie_id = $1
    `;

    const params = [categorie_id];
    if (tenant_id) {
      query += ` AND e.tenant_id = $2`;
      params.push(tenant_id);
    }

    query += ` ORDER BY e.date DESC`;

    const result = await pool.query(query, params);
    return result.rows;
  },

  async getByEventCategory(event_category_id, tenant_id = null) {
    let query = `
      SELECT e.*, 
             TO_CHAR(e.date, 'YYYY-MM-DD"T"HH24:MI:SS') as date_formatted,
             TO_CHAR(e.date_fin, 'YYYY-MM-DD"T"HH24:MI:SS') as date_fin_formatted,
             c.nom as categorie_nom,
             ec.nom as event_category_nom
      FROM evenements e
      LEFT JOIN categories c ON e.categorie_id = c.id
      LEFT JOIN event_categories ec ON e.event_category_id = ec.id
      WHERE e.event_category_id = $1
    `;

    const params = [event_category_id];
    if (tenant_id) {
      query += ` AND e.tenant_id = $2`;
      params.push(tenant_id);
    }

    query += ` ORDER BY e.date DESC`;

    const result = await pool.query(query, params);
    return result.rows;
  },

  async getUpcoming(tenant_id = null, limit = 10) {
    let query = `
      SELECT e.*, 
             TO_CHAR(e.date, 'YYYY-MM-DD"T"HH24:MI:SS') as date_formatted,
             TO_CHAR(e.date_fin, 'YYYY-MM-DD"T"HH24:MI:SS') as date_fin_formatted,
             c.nom as categorie_nom,
             ec.nom as event_category_nom
      FROM evenements e
      LEFT JOIN categories c ON e.categorie_id = c.id
      LEFT JOIN event_categories ec ON e.event_category_id = ec.id
      WHERE e.date >= NOW()
    `;

    const params = [];
    if (tenant_id) {
      query += ` AND e.tenant_id = $1`;
      params.push(tenant_id);
    }

    query += ` ORDER BY e.date ASC LIMIT $${params.length + 1}`;
    params.push(limit);

    const result = await pool.query(query, params);
    return result.rows;
  },

  async cancelEvent(id, tenant_id = null) {
    console.log(
      "Service: cancelEvent appelé avec ID:",
      id,
      "tenant_id:",
      tenant_id
    );

    // Convertir l'ID en entier
    const eventId = parseInt(id, 10);
    console.log("Service: ID converti en entier:", eventId);

    // Vérifier d'abord si l'événement existe
    let checkQuery = `SELECT id, nom, statut, tenant_id FROM evenements WHERE id = $1`;
    const checkParams = [eventId];

    if (tenant_id) {
      checkQuery += ` AND tenant_id = $2`;
      checkParams.push(tenant_id);
    }

    console.log("Service: Vérification de l'existence - Query:", checkQuery);
    console.log(
      "Service: Vérification de l'existence - Paramètres:",
      checkParams
    );

    const checkResult = await pool.query(checkQuery, checkParams);
    console.log("Service: Événement trouvé:", checkResult.rows[0]);

    if (checkResult.rows.length === 0) {
      console.log("Service: Aucun événement trouvé avec ces critères");
      return null;
    }

    let query = `
      UPDATE evenements 
      SET statut = 'annulé', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;

    const params = [eventId];
    if (tenant_id) {
      query += ` AND tenant_id = $2`;
      params.push(tenant_id);
    }

    query += ` RETURNING id, nom, statut, tenant_id, date, date_fin, categorie_id, createur_id, created_at, has_planning, event_category_id, description, lieu, updated_at, badges_requis, responsable_id, TO_CHAR(date, 'YYYY-MM-DD"T"HH24:MI:SS') as date_formatted, TO_CHAR(date_fin, 'YYYY-MM-DD"T"HH24:MI:SS') as date_fin_formatted`;

    console.log("Service: Query SQL:", query);
    console.log("Service: Paramètres:", params);

    const result = await pool.query(query, params);
    console.log("Service: Nombre de lignes modifiées:", result.rowCount);
    console.log("Service: Résultat de la requête:", result.rows[0]);

    return result.rows[0];
  },

  async reactivateEvent(id, tenant_id = null) {
    console.log(
      "Service: reactivateEvent appelé avec ID:",
      id,
      "tenant_id:",
      tenant_id
    );

    // Convertir l'ID en entier
    const eventId = parseInt(id, 10);
    console.log("Service: ID converti en entier:", eventId);

    let query = `
      UPDATE evenements 
      SET statut = 'planifié', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `;

    const params = [eventId];
    if (tenant_id) {
      query += ` AND tenant_id = $2`;
      params.push(tenant_id);
    }

    query += ` RETURNING id, nom, statut, tenant_id, date, date_fin, categorie_id, createur_id, created_at, has_planning, event_category_id, description, lieu, updated_at, badges_requis, responsable_id, TO_CHAR(date, 'YYYY-MM-DD"T"HH24:MI:SS') as date_formatted, TO_CHAR(date_fin, 'YYYY-MM-DD"T"HH24:MI:SS') as date_fin_formatted`;

    console.log("Service: Query SQL:", query);
    console.log("Service: Paramètres:", params);

    const result = await pool.query(query, params);
    console.log("Service: Nombre de lignes modifiées:", result.rowCount);
    console.log("Service: Résultat de la requête:", result.rows[0]);

    return result.rows[0];
  },

  // Méthodes pour l'inscription directe aux événements sociaux
  async inscrireMembreEvent(eventId, membreId) {
    const parsedEventId = parseInt(eventId, 10);
    const parsedMembreId = parseInt(membreId, 10);
    console.log(
      "Service: inscrireMembreEvent appelé avec eventId:",
      parsedEventId,
      "membreId:",
      parsedMembreId
    );

    // Vérifier que l'événement existe et n'a pas de planning
    const eventQuery =
      "SELECT id, nom, has_planning, statut FROM evenements WHERE id = $1";
    const eventResult = await pool.query(eventQuery, [parsedEventId]);

    if (eventResult.rows.length === 0) {
      throw new Error("Événement non trouvé");
    }

    const event = eventResult.rows[0];
    if (event.has_planning) {
      throw new Error(
        "Cet événement a un planning, utilisez les tranches horaires"
      );
    }

    if (event.statut === "annulé") {
      throw new Error("Impossible de s'inscrire à un événement annulé");
    }

    // Vérifier si l'inscription existe déjà
    const existingQuery =
      "SELECT id FROM evenements_inscriptions WHERE evenement_id = $1 AND membre_id = $2";
    const existingResult = await pool.query(existingQuery, [
      parsedEventId,
      parsedMembreId,
    ]);

    if (existingResult.rows.length > 0) {
      throw new Error("Vous êtes déjà inscrit à cet événement");
    }

    // Créer l'inscription
    const insertQuery = `
      INSERT INTO evenements_inscriptions (evenement_id, membre_id, date_inscription) 
      VALUES ($1, $2, CURRENT_TIMESTAMP) 
      RETURNING id, evenement_id, membre_id, date_inscription
    `;

    try {
      const result = await pool.query(insertQuery, [
        parsedEventId,
        parsedMembreId,
      ]);
      console.log("Service: inscrireMembreEvent résultat:", result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error("Service: Erreur dans inscrireMembreEvent:", error);
      throw error;
    }
  },

  async desinscrireMembreEvent(eventId, membreId) {
    const parsedEventId = parseInt(eventId, 10);
    const parsedMembreId = parseInt(membreId, 10);
    console.log(
      "Service: desinscrireMembreEvent appelé avec eventId:",
      parsedEventId,
      "membreId:",
      parsedMembreId
    );

    const query =
      "DELETE FROM evenements_inscriptions WHERE evenement_id = $1 AND membre_id = $2 RETURNING id";

    try {
      const result = await pool.query(query, [parsedEventId, parsedMembreId]);
      console.log("Service: desinscrireMembreEvent résultat:", result.rows[0]);

      if (result.rows.length === 0) {
        throw new Error("Inscription non trouvée");
      }

      return result.rows[0];
    } catch (error) {
      console.error("Service: Erreur dans desinscrireMembreEvent:", error);
      throw error;
    }
  },

  async getEventParticipants(eventId) {
    const parsedEventId = parseInt(eventId, 10);
    console.log(
      "Service: getEventParticipants appelé avec eventId:",
      parsedEventId
    );

    const query = `
      SELECT 
        ei.id,
        ei.evenement_id,
        ei.membre_id,
        ei.date_inscription,
        m.nom as membre_nom,
        m.prenom as membre_prenom,
        m.email as membre_email
      FROM evenements_inscriptions ei
      JOIN membres m ON ei.membre_id = m.id
      WHERE ei.evenement_id = $1
      ORDER BY ei.date_inscription ASC
    `;

    try {
      const result = await pool.query(query, [parsedEventId]);
      console.log("Service: getEventParticipants résultat:", result.rows);
      return result.rows;
    } catch (error) {
      console.error("Service: Erreur dans getEventParticipants:", error);
      throw error;
    }
  },

  async getUserEventInscription(eventId, membreId) {
    const parsedEventId = parseInt(eventId, 10);
    const parsedMembreId = parseInt(membreId, 10);
    console.log(
      "Service: getUserEventInscription appelé avec eventId:",
      parsedEventId,
      "membreId:",
      parsedMembreId
    );

    const query = `
      SELECT 
        ei.id,
        ei.evenement_id,
        ei.membre_id,
        ei.date_inscription
      FROM evenements_inscriptions ei
      WHERE ei.evenement_id = $1 AND ei.membre_id = $2
    `;

    try {
      const result = await pool.query(query, [parsedEventId, parsedMembreId]);
      console.log(
        "Service: getUserEventInscription résultat:",
        result.rows[0] || null
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error("Service: Erreur dans getUserEventInscription:", error);
      throw error;
    }
  },
};

module.exports = evenementService;
