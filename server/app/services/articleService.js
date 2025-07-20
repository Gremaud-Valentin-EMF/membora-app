const pool = require("../config/db");

const articleService = {
  // Méthodes publiques (articles publiés seulement)
  async getPublic(tenant_id = null) {
    let query = `
      SELECT a.*, m.nom as auteur_nom 
      FROM articles a 
      LEFT JOIN membres m ON a.auteur_id = m.id 
      WHERE a.etat = 'publié'
    `;
    const params = [];

    if (tenant_id) {
      query += ` AND a.tenant_id = $1`;
      params.push(tenant_id);
    }

    query += ` ORDER BY a.date_publication DESC, a.created_at DESC`;

    const result = await pool.query(query, params);
    return result.rows;
  },

  async getPublicById(id) {
    const result = await pool.query(
      `
      SELECT a.*, m.nom as auteur_nom 
      FROM articles a 
      LEFT JOIN membres m ON a.auteur_id = m.id 
      WHERE a.id = $1 AND a.etat = 'publié'
    `,
      [id]
    );
    return result.rows[0];
  },

  // Méthodes authentifiées (tous les articles)
  async getAll(tenant_id = null) {
    let query = `
      SELECT a.*, m.nom as auteur_nom 
      FROM articles a 
      LEFT JOIN membres m ON a.auteur_id = m.id 
    `;
    const params = [];

    if (tenant_id) {
      query += ` WHERE a.tenant_id = $1`;
      params.push(tenant_id);
    }

    query += ` ORDER BY a.created_at DESC`;

    const result = await pool.query(query, params);
    return result.rows;
  },

  async getById(id) {
    const result = await pool.query(
      `
      SELECT a.*, m.nom as auteur_nom 
      FROM articles a 
      LEFT JOIN membres m ON a.auteur_id = m.id 
      WHERE a.id = $1
    `,
      [id]
    );
    return result.rows[0];
  },

  async create({
    titre,
    contenu,
    etat,
    auteur_id,
    tenant_id,
    date_publication,
  }) {
    const result = await pool.query(
      `INSERT INTO articles (titre, contenu, etat, auteur_id, tenant_id, date_publication, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *`,
      [titre, contenu, etat, auteur_id, tenant_id, date_publication]
    );
    return result.rows[0];
  },

  async update(id, data) {
    const fields = Object.keys(data);
    const values = Object.values(data);
    if (fields.length === 0) {
      const result = await pool.query(
        `
        SELECT a.*, m.nom as auteur_nom 
        FROM articles a 
        LEFT JOIN membres m ON a.auteur_id = m.id 
        WHERE a.id = $1
      `,
        [id]
      );
      return result.rows[0];
    }
    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(", ");
    const result = await pool.query(
      `UPDATE articles SET ${setClause} WHERE id = $${
        fields.length + 1
      } RETURNING *`,
      [...values, id]
    );
    return result.rows[0];
  },

  async delete(id) {
    await pool.query("DELETE FROM articles WHERE id = $1", [id]);
  },

  async archive(id) {
    const result = await pool.query(
      "UPDATE articles SET etat = 'archivé' WHERE id = $1 RETURNING *",
      [id]
    );
    return result.rows[0];
  },

  async unarchive(id) {
    const result = await pool.query(
      "UPDATE articles SET etat = 'brouillon' WHERE id = $1 RETURNING *",
      [id]
    );
    return result.rows[0];
  },
};

module.exports = articleService;
