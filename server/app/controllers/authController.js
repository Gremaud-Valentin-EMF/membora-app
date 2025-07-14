const authService = require("../services/authService");

const authController = {
  async register(req, res) {
    try {
      const membre = await authService.register(req.body);
      res.status(201).json(membre);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
  async login(req, res) {
    try {
      const { membre, token } = await authService.login(req.body);
      res.json({ membre, token });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },
};

module.exports = authController;
