const pool = require("../config/db");

const trancheService = {
  async create({ evenement_id, debut, fin, valeur_coches, badge_categorie, tenant_id }) {
    const result = await pool.query(
      `INSERT INTO tranches_horaires (evenement_id, debut, fin, valeur_coches, badge_categorie, tenant_id)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [evenement_id, debut, fin, valeur_coches, badge_categorie, tenant_id]
    );
    return result.rows[0];
  },
  async update(id, data) {
    const fields = Object.keys(data);
    if (fields.length === 0) return this.getById(id);
    const values = Object.values(data);
    const setClause = fields.map((f,i)=>`${f} = $${i+1}`).join(', ');
    const result = await pool.query(
      `UPDATE tranches_horaires SET ${setClause} WHERE id = $${fields.length+1} RETURNING *`,
      [...values, id]
    );
    return result.rows[0];
  },
  async delete(id){
    await pool.query('DELETE FROM tranches_horaires WHERE id = $1', [id]);
  },
  async getById(id){
    const result = await pool.query('SELECT * FROM tranches_horaires WHERE id=$1',[id]);
    return result.rows[0];
  },
  async getByEvenement(evenement_id){
    const result = await pool.query('SELECT * FROM tranches_horaires WHERE evenement_id=$1',[evenement_id]);
    return result.rows;
  }
};

module.exports = trancheService;
