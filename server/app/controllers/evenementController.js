const evenementService = require("../services/evenementService");

const evenementController = {
  async getAll(req, res) {
    const evenements = await evenementService.getAll();
    res.json(evenements);
  },
  async getById(req, res) {
    const evenement = await evenementService.getById(req.params.id);
    if (!evenement)
      return res.status(404).json({ message: "Événement non trouvé" });
    res.json(evenement);
  },
  async create(req, res) {
    try {
      const evenement = await evenementService.create(req.body);
      res.status(201).json(evenement);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
  async update(req, res) {
    try {
      const evenement = await evenementService.update(req.params.id, req.body);
      res.json(evenement);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
  async delete(req, res) {
    await evenementService.delete(req.params.id);
    res.status(204).end();
  },
  async getByCategorie(req, res) {
    const evenements = await evenementService.getByCategorie(
      req.params.categorie_id
    );
    res.json(evenements);
  },
};

module.exports = evenementController;
