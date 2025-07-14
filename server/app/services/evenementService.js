const pool = require("../config/db");

const evenementService = {
  async getAll() {
    const result = await pool.query("SELECT * FROM evenements");
    return result.rows;
  },
  async getById(id) {
    const result = await pool.query("SELECT * FROM evenements WHERE id = $1", [
      id,
    ]);
    return result.rows[0];
  },
  async create({ nom, date, categorie_id, statut, tenant_id }) {
    const result = await pool.query(
      `INSERT INTO evenements (nom, date, categorie_id, statut, tenant_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [nom, date, categorie_id, statut, tenant_id]
    );
    return result.rows[0];
  },
  async update(id, data) {
    const fields = Object.keys(data);
    const values = Object.values(data);
    if (fields.length === 0) {
      const result = await pool.query(
        "SELECT * FROM evenements WHERE id = $1",
        [id]
      );
      return result.rows[0];
    }
    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(", ");
    const result = await pool.query(
      `UPDATE evenements SET ${setClause} WHERE id = $${
        fields.length + 1
      } RETURNING *`,
      [...values, id]
    );
    return result.rows[0];
  },
  async delete(id) {
    await pool.query("DELETE FROM evenements WHERE id = $1", [id]);
  },
  async getByCategorie(categorie_id) {
    const result = await pool.query(
      "SELECT * FROM evenements WHERE categorie_id = $1",
      [categorie_id]
    );
    return result.rows;
  },
};

module.exports = evenementService;
