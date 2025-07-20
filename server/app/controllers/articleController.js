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
      const article = await articleService.create(req.body);
      res.status(201).json(article);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  async update(req, res) {
    try {
      const article = await articleService.update(req.params.id, req.body);
      res.json(article);
    } catch (err) {
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
