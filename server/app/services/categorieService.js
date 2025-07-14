const pool = require("../config/db");

const categorieService = {
  async getAll() {
    const result = await pool.query("SELECT * FROM categories");
    return result.rows;
  },
  async getById(id) {
    const result = await pool.query("SELECT * FROM categories WHERE id = $1", [
      id,
    ]);
    return result.rows[0];
  },
  async create({ nom, description, tenant_id }) {
    const result = await pool.query(
      `INSERT INTO categories (nom, description, tenant_id)
       VALUES ($1, $2, $3) RETURNING *`,
      [nom, description, tenant_id]
    );
    return result.rows[0];
  },
  async update(id, data) {
    const fields = Object.keys(data);
    const values = Object.values(data);
    if (fields.length === 0) {
      const result = await pool.query(
        "SELECT * FROM categories WHERE id = $1",
        [id]
      );
      return result.rows[0];
    }
    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(", ");
    const result = await pool.query(
      `UPDATE categories SET ${setClause} WHERE id = $${
        fields.length + 1
      } RETURNING *`,
      [...values, id]
    );
    return result.rows[0];
  },
  async delete(id) {
    await pool.query("DELETE FROM categories WHERE id = $1", [id]);
  },
};

module.exports = categorieService;
