const membreService = require("../services/membreService");

const membreController = {
  async getAll(req, res) {
    const membres = await membreService.getAll();
    res.json(membres);
  },
  async getById(req, res) {
    const membre = await membreService.getById(req.params.id);
    if (!membre) return res.status(404).json({ message: "Membre non trouvé" });
    res.json(membre);
  },
  async update(req, res) {
    try {
      const membre = await membreService.update(req.params.id, req.body);
      res.json(membre);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
  async delete(req, res) {
    await membreService.delete(req.params.id);
    res.status(204).end();
  },
  async setResponsable(req, res) {
    const membre = await membreService.setResponsable(req.params.id);
    res.json(membre);
  },
  async unsetResponsable(req, res) {
    const membre = await membreService.unsetResponsable(req.params.id);
    res.json(membre);
  },
};

module.exports = membreController;
