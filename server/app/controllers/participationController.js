const participationService = require("../services/participationService");

const participationController = {
  async create(req, res) {
    try {
      const participation = await participationService.create(req.body);
      res.status(201).json(participation);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
  async delete(req, res) {
    await participationService.delete(req.params.id);
    res.status(204).end();
  },
  async getByMembre(req, res) {
    const participations = await participationService.getByMembre(
      req.params.membre_id
    );
    res.json(participations);
  },
  async getByEvenement(req, res) {
    const participations = await participationService.getByEvenement(
      req.params.evenement_id
    );
    res.json(participations);
  },
  async getAll(req, res) {
    const participations = await participationService.getAll();
    res.json(participations);
  },
};

module.exports = participationController;
