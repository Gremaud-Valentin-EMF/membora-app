const eventCategoryService = require("../services/eventCategoryService");

const eventCategoryController = {
  async getAll(req, res) {
    try {
      const categories = await eventCategoryService.getAll(req.user.tenant_id);
      res.json(categories);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async getById(req, res) {
    try {
      const category = await eventCategoryService.getById(
        req.params.id,
        req.user.tenant_id
      );
      if (!category) {
        return res
          .status(404)
          .json({ message: "Catégorie d'événement non trouvée" });
      }
      res.json(category);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async create(req, res) {
    try {
      const categoryData = {
        ...req.body,
        tenant_id: req.user.tenant_id,
      };
      const category = await eventCategoryService.create(categoryData);
      res.status(201).json(category);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  async update(req, res) {
    try {
      const category = await eventCategoryService.update(
        req.params.id,
        req.body,
        req.user.tenant_id
      );
      if (!category) {
        return res
          .status(404)
          .json({ message: "Catégorie d'événement non trouvée" });
      }
      res.json(category);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  async delete(req, res) {
    try {
      await eventCategoryService.delete(req.params.id, req.user.tenant_id);
      res.status(204).end();
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
};

module.exports = eventCategoryController;
