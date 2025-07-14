const categorieService = require("../services/categorieService");

const categorieController = {
  async getAll(req, res) {
    const categories = await categorieService.getAll();
    res.json(categories);
  },
  async getById(req, res) {
    const categorie = await categorieService.getById(req.params.id);
    if (!categorie)
      return res.status(404).json({ message: "Catégorie non trouvée" });
    res.json(categorie);
  },
  async create(req, res) {
    try {
      const categorie = await categorieService.create(req.body);
      res.status(201).json(categorie);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
  async update(req, res) {
    try {
      const categorie = await categorieService.update(req.params.id, req.body);
      res.json(categorie);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
  async delete(req, res) {
    await categorieService.delete(req.params.id);
    res.status(204).end();
  },
};

module.exports = categorieController;
