const trancheService = require("../services/trancheService");

const trancheController = {
  // Gestion des tranches horaires
  async getAllTranches(req, res) {
    try {
      const tranches = await trancheService.getAllTranches(req.user.tenant_id);
      res.json(tranches);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async getTrancheById(req, res) {
    try {
      const tranche = await trancheService.getTrancheById(
        req.params.id,
        req.user.tenant_id
      );
      if (!tranche) {
        return res.status(404).json({ message: "Tranche horaire non trouvée" });
      }
      res.json(tranche);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async createTranche(req, res) {
    try {
      const trancheData = {
        ...req.body,
        tenant_id: req.user.tenant_id,
      };
      const tranche = await trancheService.createTranche(trancheData);
      res.status(201).json(tranche);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  async updateTranche(req, res) {
    try {
      const tranche = await trancheService.updateTranche(
        req.params.id,
        req.body,
        req.user.tenant_id
      );
      if (!tranche) {
        return res.status(404).json({ message: "Tranche horaire non trouvée" });
      }
      res.json(tranche);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  async deleteTranche(req, res) {
    try {
      await trancheService.deleteTranche(req.params.id, req.user.tenant_id);
      res.status(204).end();
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  // Gestion des inscriptions
  async getTrancheInscriptions(req, res) {
    try {
      const inscriptions = await trancheService.getTrancheInscriptions(
        req.params.id,
        req.user.tenant_id
      );
      res.json(inscriptions);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async inscrireMembre(req, res) {
    try {
      const { membre_id } = req.body;
      const inscription = await trancheService.inscrireMembre(
        req.params.id,
        membre_id || req.user.id, // Si pas de membre_id, utiliser l'utilisateur connecté
        req.user.tenant_id
      );
      res.status(201).json(inscription);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  async desinscrireMembre(req, res) {
    try {
      await trancheService.desinscrireMembre(
        req.params.inscription_id,
        req.user.tenant_id
      );
      res.status(204).end();
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  // Routes spéciales
  async getTranchesByEvenement(req, res) {
    try {
      const tranches = await trancheService.getTranchesByEvenement(
        req.params.evenement_id,
        req.user.tenant_id
      );
      res.json(tranches);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async getMembreInscriptionsByEvenement(req, res) {
    try {
      const inscriptions =
        await trancheService.getMembreInscriptionsByEvenement(
          req.params.evenement_id,
          req.params.membre_id,
          req.user.tenant_id
        );
      res.json(inscriptions);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async getMembreInscriptions(req, res) {
    try {
      const inscriptions = await trancheService.getMembreInscriptions(
        req.params.membre_id,
        req.user.tenant_id
      );
      res.json(inscriptions);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};

module.exports = trancheController;
