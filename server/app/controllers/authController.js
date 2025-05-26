const userService = require("../services/userService");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email et mot de passe requis" });
    }

    const user = await userService.getUserByEmail(email);

    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!user || !isValid) {
      return res.status(401).json({ error: "Identifiants invalides" });
    }

    // Création du token JWT
    const token = jwt.sign(
      {
        id: user.pk_users,
        email: user.email,
        fk_tenant: user.fk_tenant,
      },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.status(200).json({
      message: "Connexion réussie",
      token,
      user: {
        pk_users: user.pk_users,
        name: user.name,
        email: user.email,
        fk_tenant: user.fk_tenant,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.register = async (req, res) => {
  try {
    const newUser = await userService.createUser(req.body);
    res.status(201).json({ newUser });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getConnectedUser = async (req, res) => {
  try {
    const { pk_users, fk_tenant } = req.user;
    const user = await userService.getConnectedUser(pk_users, fk_tenant);
    res.json(user);
  } catch (error) {
    console.error("Erreur getConnectedUser:", err);
    res.status(500).json({ message: err.message || "Erreur serveur." });
  }
};
