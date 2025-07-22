const pool = require("../config/db");

const badgeService = {
  async create({ membre_id, categorie }) {
    const res = await pool.query(
      `INSERT INTO badges (membre_id, categorie) VALUES ($1,$2) RETURNING *`,
      [membre_id, categorie]
    );
    return res.rows[0];
  },
  async getByMembre(membre_id){
    const res = await pool.query('SELECT * FROM badges WHERE membre_id=$1',[membre_id]);
    return res.rows;
  }
};

module.exports = badgeService;
