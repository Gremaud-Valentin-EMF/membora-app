const badgeService = require("../services/badgeService");

const badgeController = {
  // Gestion des badges système
  async getAllBadges(req, res) {
    try {
      const badges = await badgeService.getAllBadges(req.user.tenant_id);
      res.json(badges);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async getBadgeById(req, res) {
    try {
      const badge = await badgeService.getBadgeById(
        req.params.id,
        req.user.tenant_id
      );
      if (!badge) {
        return res.status(404).json({ message: "Badge non trouvé" });
      }
      res.json(badge);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async createBadge(req, res) {
    try {
      const badgeData = {
        ...req.body,
        tenant_id: req.user.tenant_id,
      };
      const badge = await badgeService.createBadge(badgeData);
      res.status(201).json(badge);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  async updateBadge(req, res) {
    try {
      const badge = await badgeService.updateBadge(
        req.params.id,
        req.body,
        req.user.tenant_id
      );
      if (!badge) {
        return res.status(404).json({ message: "Badge non trouvé" });
      }
      res.json(badge);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  async deleteBadge(req, res) {
    try {
      await badgeService.deleteBadge(req.params.id, req.user.tenant_id);
      res.status(204).end();
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  // Gestion des attributions
  async getBadgeAttributions(req, res) {
    try {
      const attributions = await badgeService.getBadgeAttributions(
        req.params.id,
        req.user.tenant_id
      );
      res.json(attributions);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async attribuerBadge(req, res) {
    try {
      const { membre_id } = req.body;
      const attribution = await badgeService.attribuerBadge(
        req.params.id,
        membre_id,
        req.user.id,
        req.user.tenant_id
      );
      res.status(201).json(attribution);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  async retirerAttribution(req, res) {
    try {
      await badgeService.retirerAttribution(
        req.params.attribution_id,
        req.user.tenant_id
      );
      res.status(204).end();
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  async getMembreBadges(req, res) {
    try {
      const badges = await badgeService.getMembreBadges(
        req.params.membreId,
        req.user.tenant_id
      );
      res.json(badges);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};

module.exports = badgeController;
