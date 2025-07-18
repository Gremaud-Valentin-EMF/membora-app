const pool = require("../config/db");

const participationService = {
  async create({ membre_id, evenement_id, present, tenant_id }) {
    const result = await pool.query(
      `INSERT INTO participations (membre_id, evenement_id, present, tenant_id)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [membre_id, evenement_id, present, tenant_id]
    );
    return result.rows[0];
  },
  async delete(id) {
    await pool.query("DELETE FROM participations WHERE id = $1", [id]);
  },
  async getByMembre(membre_id) {
    const result = await pool.query(
      "SELECT * FROM participations WHERE membre_id = $1",
      [membre_id]
    );
    return result.rows;
  },
  async getByEvenement(evenement_id) {
    const result = await pool.query(
      `SELECT p.*, m.nom as membre_nom, m.email as membre_email 
       FROM participations p 
       JOIN membres m ON p.membre_id = m.id 
       WHERE p.evenement_id = $1`,
      [evenement_id]
    );
    return result.rows;
  },
  async getAll() {
    const result = await pool.query("SELECT * FROM participations");
    return result.rows;
  },
};

module.exports = participationService;
