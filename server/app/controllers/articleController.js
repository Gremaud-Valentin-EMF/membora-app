const articleService = require("../services/articleService");

const articleController = {
  async getAll(req, res) {
    const articles = await articleService.getAll();
    res.json(articles);
  },
  async getById(req, res) {
    const article = await articleService.getById(req.params.id);
    if (!article)
      return res.status(404).json({ message: "Article non trouvé" });
    res.json(article);
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
    await articleService.delete(req.params.id);
    res.status(204).end();
  },
  async archiver(req, res) {
    await articleService.archiver(req.params.id);
    res.json({ message: "Article archivé" });
  },
  async desarchiver(req, res) {
    await articleService.desarchiver(req.params.id);
    res.json({ message: "Article désarchivé" });
  },
};

module.exports = articleController;
