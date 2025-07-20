const pool = require("../config/db");
const bcrypt = require("bcrypt");

const membreService = {
  // Méthode publique (données limitées)
  async getPublicById(id) {
    const result = await pool.query(
      "SELECT id, nom FROM membres WHERE id = $1",
      [id]
    );
    return result.rows[0];
  },

  // Méthodes authentifiées
  async getAll() {
    const result = await pool.query("SELECT * FROM membres");
    return result.rows;
  },

  async getById(id) {
    const result = await pool.query("SELECT * FROM membres WHERE id = $1", [
      id,
    ]);
    return result.rows[0];
  },

  async findByEmail(email) {
    const result = await pool.query("SELECT * FROM membres WHERE email = $1", [
      email,
    ]);
    return result.rows[0];
  },

  async create({ email, nom, password_hash, role, tenant_id }) {
    const result = await pool.query(
      `INSERT INTO membres (email, nom, password_hash, role, tenant_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [email, nom, password_hash, role, tenant_id]
    );
    return result.rows[0];
  },

  async update(id, data) {
    if (data.password) {
      data.password_hash = await bcrypt.hash(data.password, 10);
      delete data.password;
    }
    const fields = Object.keys(data);
    const values = Object.values(data);
    if (fields.length === 0) {
      const result = await pool.query("SELECT * FROM membres WHERE id = $1", [
        id,
      ]);
      return result.rows[0];
    }
    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(", ");
    const result = await pool.query(
      `UPDATE membres SET ${setClause} WHERE id = $${
        fields.length + 1
      } RETURNING *`,
      [...values, id]
    );
    return result.rows[0];
  },

  async delete(id) {
    await pool.query("DELETE FROM membres WHERE id = $1", [id]);
  },

  async setResponsable(id) {
    const result = await pool.query(
      `UPDATE membres SET role = 'responsable' WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0];
  },

  async unsetResponsable(id) {
    const result = await pool.query(
      `UPDATE membres SET role = 'membre' WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0];
  },
};

module.exports = membreService;
