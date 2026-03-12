const pool = require("../config/db");

const eventCategoryService = {
  async getAll(tenant_id) {
    const result = await pool.query(
      `SELECT ec.*, 
              COUNT(e.id) as evenements_count
       FROM event_categories ec
       LEFT JOIN evenements e ON ec.id = e.event_category_id
       WHERE ec.tenant_id = $1
       GROUP BY ec.id
       ORDER BY ec.created_at DESC`,
      [tenant_id]
    );
    return result.rows;
  },

  async getById(id, tenant_id) {
    const result = await pool.query(
      `SELECT * FROM event_categories 
       WHERE id = $1 AND tenant_id = $2`,
      [id, tenant_id]
    );
    return result.rows[0];
  },

  async create({ nom, description, tenant_id }) {
    const result = await pool.query(
      `INSERT INTO event_categories (nom, description, tenant_id)
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [nom, description, tenant_id]
    );
    return result.rows[0];
  },

  async update(id, data, tenant_id) {
    const fields = Object.keys(data);
    const values = Object.values(data);

    if (fields.length === 0) {
      return this.getById(id, tenant_id);
    }

    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(", ");
    const result = await pool.query(
      `UPDATE event_categories SET ${setClause} 
       WHERE id = $${fields.length + 1} AND tenant_id = $${fields.length + 2} 
       RETURNING *`,
      [...values, id, tenant_id]
    );
    return result.rows[0];
  },

  async delete(id, tenant_id) {
    // Vérifier s'il y a des événements liés
    const eventsCheck = await pool.query(
      `SELECT COUNT(*) as count FROM evenements WHERE event_category_id = $1`,
      [id]
    );

    if (parseInt(eventsCheck.rows[0].count) > 0) {
      throw new Error(
        "Impossible de supprimer cette catégorie car elle est utilisée par des événements"
      );
    }

    await pool.query(
      `DELETE FROM event_categories WHERE id = $1 AND tenant_id = $2`,
      [id, tenant_id]
    );
  },
};

module.exports = eventCategoryService;
