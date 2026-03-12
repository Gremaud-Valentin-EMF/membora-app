const evenementService = require("../services/evenementService");

const evenementController = {
  async getAll(req, res) {
    try {
      const evenements = await evenementService.getAll(req.user.tenant_id);
      res.json(evenements);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async getById(req, res) {
    try {
      const evenement = await evenementService.getById(
        req.params.id,
        req.user.tenant_id
      );
      if (!evenement) {
        return res.status(404).json({ message: "Événement non trouvé" });
      }
      res.json(evenement);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async create(req, res) {
    try {
      const evenementData = {
        ...req.body,
        tenant_id: req.user.tenant_id,
        createur_id: req.user.id,
      };
      const evenement = await evenementService.create(evenementData);
      res.status(201).json(evenement);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  async update(req, res) {
    try {
      const evenement = await evenementService.update(
        req.params.id,
        req.body,
        req.user.tenant_id
      );
      if (!evenement) {
        return res.status(404).json({ message: "Événement non trouvé" });
      }
      res.json(evenement);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  async delete(req, res) {
    try {
      await evenementService.delete(req.params.id, req.user.tenant_id);
      res.status(204).end();
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  async getByCategorie(req, res) {
    try {
      const evenements = await evenementService.getByCategorie(
        req.params.categorie_id,
        req.user.tenant_id
      );
      res.json(evenements);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async getByEventCategory(req, res) {
    try {
      const evenements = await evenementService.getByEventCategory(
        req.params.event_category_id,
        req.user.tenant_id
      );
      res.json(evenements);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async getUpcoming(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const evenements = await evenementService.getUpcoming(
        req.user.tenant_id,
        limit
      );
      res.json(evenements);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async cancelEvent(req, res) {
    try {
      console.log(
        "Controller: cancelEvent - ID:",
        req.params.id,
        "tenant_id:",
        req.user.tenant_id
      );

      const evenement = await evenementService.cancelEvent(
        req.params.id,
        req.user.tenant_id
      );
      if (!evenement) {
        console.log("Controller: Événement non trouvé");
        return res.status(404).json({ message: "Événement non trouvé" });
      }
      console.log("Controller: Événement annulé avec succès:", evenement);
      res.json(evenement);
    } catch (err) {
      console.error("Controller: Erreur lors de l'annulation:", err);
      res.status(400).json({ message: err.message });
    }
  },

  async reactivateEvent(req, res) {
    try {
      console.log(
        "Controller: reactivateEvent - ID:",
        req.params.id,
        "tenant_id:",
        req.user.tenant_id
      );

      const evenement = await evenementService.reactivateEvent(
        req.params.id,
        req.user.tenant_id
      );
      if (!evenement) {
        console.log("Controller: Événement non trouvé");
        return res.status(404).json({ message: "Événement non trouvé" });
      }
      console.log("Controller: Événement réactivé avec succès:", evenement);
      res.json(evenement);
    } catch (err) {
      console.error("Controller: Erreur lors de la réactivation:", err);
      res.status(400).json({ message: err.message });
    }
  },
};

module.exports = evenementController;
