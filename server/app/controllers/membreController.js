const membreService = require("../services/membreService");

const membreController = {
  // Méthode publique (données limitées)
  async getPublicById(req, res) {
    try {
      const membre = await membreService.getPublicById(req.params.id);
      if (!membre) {
        return res.status(404).json({ message: "Membre non trouvé" });
      }
      res.json(membre);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // Méthodes authentifiées
  async getAll(req, res) {
    try {
      const membres = await membreService.getAll();
      res.json(membres);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async getById(req, res) {
    try {
      const membre = await membreService.getById(req.params.id);
      if (!membre) {
        return res.status(404).json({ message: "Membre non trouvé" });
      }
      res.json(membre);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
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
    try {
      await membreService.delete(req.params.id);
      res.status(204).end();
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async setResponsable(req, res) {
    try {
      const membre = await membreService.setResponsable(req.params.id);
      res.json(membre);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async unsetResponsable(req, res) {
    try {
      const membre = await membreService.unsetResponsable(req.params.id);
      res.json(membre);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};

module.exports = membreController;
