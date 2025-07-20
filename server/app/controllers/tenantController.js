const tenantService = require("../services/tenantService");

const tenantController = {
  async getAll(req, res) {
    const tenants = await tenantService.getAll();
    res.json(tenants);
  },
  async getById(req, res) {
    const tenant = await tenantService.findById(req.params.id);
    if (!tenant) return res.status(404).json({ message: "Tenant non trouvé" });
    res.json(tenant);
  },
  async getBySlug(req, res) {
    const tenant = await tenantService.findBySlug(req.params.slug);
    if (!tenant) return res.status(404).json({ message: "Tenant non trouvé" });
    res.json(tenant);
  },
  async create(req, res) {
    try {
      const tenant = await tenantService.create(req.body);
      res.status(201).json(tenant);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
  async update(req, res) {
    try {
      const tenant = await tenantService.update(req.params.id, req.body);
      res.json(tenant);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
  async delete(req, res) {
    await tenantService.delete(req.params.id);
    res.status(204).end();
  },
};

module.exports = tenantController;
