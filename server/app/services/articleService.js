const pool = require("../config/db");
const uploadService = require("./uploadService");

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
    image = null,
  }) {
    let image_url = null;

    // Upload de l'image si elle existe
    if (image) {
      try {
        const uploadResult = await uploadService.uploadImage(image, "articles");
        image_url = uploadResult.url;
      } catch (error) {
        console.error("Error uploading image:", error);
        throw new Error("Erreur lors de l'upload de l'image");
      }
    }

    const result = await pool.query(
      `INSERT INTO articles (titre, contenu, etat, auteur_id, tenant_id, date_publication, image_url, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING *`,
      [titre, contenu, etat, auteur_id, tenant_id, date_publication, image_url]
    );
    return result.rows[0];
  },

  async update(id, data) {
    console.log("ArticleService.update - ID:", id);
    console.log("ArticleService.update - Data:", data);

    const {
      titre,
      contenu,
      etat,
      date_publication,
      image = null,
      keep_existing_image = false,
    } = data;

    console.log("ArticleService.update - Extracted values:", {
      titre,
      contenu,
      etat,
      date_publication,
      image: image ? "present" : "null",
      keep_existing_image,
    });

    // Récupérer l'article existant pour l'image
    const existingArticle = await this.getById(id);
    let image_url = existingArticle.image_url;

    // Upload de la nouvelle image si elle existe
    if (image) {
      try {
        const uploadResult = await uploadService.uploadImage(image, "articles");
        image_url = uploadResult.url;
      } catch (error) {
        console.error("Error uploading image:", error);
        throw new Error("Erreur lors de l'upload de l'image");
      }
    } else if (!keep_existing_image) {
      // Si on ne garde pas l'image existante et qu'il n'y a pas de nouvelle image
      image_url = null;
    }

    // Construire les champs à mettre à jour
    const updateFields = {};

    // Ajouter seulement les champs qui ont des valeurs
    if (titre !== undefined && titre !== null) updateFields.titre = titre;
    if (contenu !== undefined && contenu !== null)
      updateFields.contenu = contenu;
    if (etat !== undefined && etat !== null) updateFields.etat = etat;
    if (date_publication !== undefined && date_publication !== null)
      updateFields.date_publication = date_publication;
    if (image_url !== undefined) updateFields.image_url = image_url;

    console.log("ArticleService.update - Update fields:", updateFields);

    const fields = Object.keys(updateFields);
    const values = Object.values(updateFields);

    console.log("ArticleService.update - Fields:", fields);
    console.log("ArticleService.update - Values:", values);

    if (fields.length === 0) {
      console.log(
        "ArticleService.update - No fields to update, returning existing article"
      );
      return existingArticle;
    }

    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(", ");
    console.log(
      "ArticleService.update - SQL:",
      `UPDATE articles SET ${setClause} WHERE id = $${fields.length + 1}`
    );

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
