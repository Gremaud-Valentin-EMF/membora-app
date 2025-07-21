const pool = require("../config/db");

const tenantService = {
  async create({
    nom,
    logo_url,
    primary_color,
    secondary_color,
    slug,
    titre_principal,
    texte_intro,
    icone_url,
    image_accueil_url,
    texte_presentation,
    email_contact,
    lien_instagram,
    telephone_contact,
    adresse_contact,
  }) {
    const result = await pool.query(
      `INSERT INTO tenants (
        nom, logo_url, primary_color, secondary_color, slug, created_at,
        titre_principal, texte_intro, icone_url, image_accueil_url, texte_presentation,
        email_contact, lien_instagram, telephone_contact, adresse_contact
      )
       VALUES ($1, $2, $3, $4, $5, NOW(), $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`,
      [
        nom,
        logo_url,
        primary_color,
        secondary_color,
        slug,
        titre_principal,
        texte_intro,
        icone_url,
        image_accueil_url,
        texte_presentation,
        email_contact,
        lien_instagram,
        telephone_contact,
        adresse_contact,
      ]
    );
    return result.rows[0];
  },
  async findById(id) {
    const result = await pool.query("SELECT * FROM tenants WHERE id = $1", [
      id,
    ]);
    return result.rows[0];
  },
  async findBySlug(slug) {
    const result = await pool.query("SELECT * FROM tenants WHERE slug = $1", [
      slug,
    ]);
    return result.rows[0];
  },
  async update(id, data) {
    const fields = Object.keys(data);
    const values = Object.values(data);
    if (fields.length === 0) {
      const result = await pool.query("SELECT * FROM tenants WHERE id = $1", [
        id,
      ]);
      return result.rows[0];
    }
    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(", ");
    const result = await pool.query(
      `UPDATE tenants SET ${setClause} WHERE id = $${
        fields.length + 1
      } RETURNING *`,
      [...values, id]
    );
    return result.rows[0];
  },
  async delete(id) {
    await pool.query("DELETE FROM tenants WHERE id = $1", [id]);
  },
  async getAll() {
    const result = await pool.query("SELECT * FROM tenants");
    return result.rows;
  },
};

module.exports = tenantService;
