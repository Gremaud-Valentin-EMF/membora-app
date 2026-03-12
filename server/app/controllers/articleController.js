const articleService = require("../services/articleService");

const articleController = {
  // Méthodes publiques (sans authentification)
  async getPublic(req, res) {
    try {
      const tenant_id = req.query.tenant_id
        ? parseInt(req.query.tenant_id)
        : null;
      const articles = await articleService.getPublic(tenant_id);
      res.json(articles);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async getPublicById(req, res) {
    try {
      const article = await articleService.getPublicById(req.params.id);
      if (!article) {
        return res.status(404).json({ message: "Article non trouvé" });
      }
      res.json(article);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // Méthodes authentifiées
  async getAll(req, res) {
    try {
      const tenant_id = req.query.tenant_id
        ? parseInt(req.query.tenant_id)
        : null;
      const articles = await articleService.getAll(tenant_id);
      res.json(articles);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async getById(req, res) {
    try {
      const article = await articleService.getById(req.params.id);
      if (!article) {
        return res.status(404).json({ message: "Article non trouvé" });
      }
      res.json(article);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async create(req, res) {
    try {
      // Extraire les données de l'article
      const articleData = {
        titre: req.body.titre,
        contenu: req.body.contenu,
        etat: req.body.etat,
        auteur_id: req.body.auteur_id,
        tenant_id: req.body.tenant_id,
        date_publication: req.body.date_publication,
        image: req.file, // Fichier uploadé par multer
      };

      const article = await articleService.create(articleData);
      res.status(201).json(article);
    } catch (err) {
      console.error("Error creating article:", err);
      res.status(400).json({ message: err.message });
    }
  },

  async update(req, res) {
    try {
      console.log("Update article - Body:", req.body);
      console.log("Update article - File:", req.file);
      console.log("Update article - Content-Type:", req.get("Content-Type"));

      // Vérifier que les données essentielles sont présentes
      if (!req.body.titre || !req.body.contenu || !req.body.etat) {
        return res.status(400).json({
          message: "Données manquantes: titre, contenu et etat sont requis",
        });
      }

      // Extraire les données de l'article
      const articleData = {
        titre: req.body.titre,
        contenu: req.body.contenu,
        etat: req.body.etat,
        date_publication: req.body.date_publication || null,
        image: req.file, // Fichier uploadé par multer
        keep_existing_image: req.body.keep_existing_image === "true",
      };

      console.log("Update article - Processed data:", articleData);

      const article = await articleService.update(req.params.id, articleData);
      res.json(article);
    } catch (err) {
      console.error("Error updating article:", err);
      res.status(400).json({ message: err.message });
    }
  },

  async delete(req, res) {
    try {
      await articleService.delete(req.params.id);
      res.status(204).end();
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async archive(req, res) {
    try {
      const article = await articleService.archive(req.params.id);
      res.json(article);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async unarchive(req, res) {
    try {
      const article = await articleService.unarchive(req.params.id);
      res.json(article);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};

module.exports = articleController;
