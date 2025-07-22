const pool = require("../config/db");

const inscriptionTrancheService = {
  async create({ tranche_id, membre_id }) {
    const result = await pool.query(
      `INSERT INTO inscriptions_tranches (tranche_id, membre_id)
       VALUES ($1,$2) RETURNING *`,
      [tranche_id, membre_id]
    );
    return result.rows[0];
  },
  async delete(id) {
    await pool.query('DELETE FROM inscriptions_tranches WHERE id=$1', [id]);
  },
  async getByTranche(tranche_id){
    const res = await pool.query('SELECT * FROM inscriptions_tranches WHERE tranche_id=$1',[tranche_id]);
    return res.rows;
  },
  async getByMembre(membre_id){
    const res = await pool.query('SELECT it.*, th.valeur_coches, th.evenement_id FROM inscriptions_tranches it JOIN tranches_horaires th ON it.tranche_id=th.id WHERE it.membre_id=$1',[membre_id]);
    return res.rows;
  },
  async valider(id){
    const res = await pool.query('UPDATE inscriptions_tranches SET coche_attribue=true WHERE id=$1 RETURNING *',[id]);
    return res.rows[0];
  }
};

module.exports = inscriptionTrancheService;
