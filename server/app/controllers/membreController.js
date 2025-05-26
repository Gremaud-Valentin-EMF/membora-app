const userService = require("../services/userService");

// GET /api/membres
// Récupère tous les membres du tenant (jeunesse) du responsable connecté
exports.getMembres = async (req, res) => {
  try {
    const { role, fk_tenant } = req.user;

    // Bloque l'accès si l'utilisateur n'est pas responsable
    if (role !== "responsable") {
      return res.status(403).json({ message: "Accès interdit" });
    }

    // Récupère tous les membres appartenant à la même jeunesse (tenant)
    const users = await userService.getUsersByTenant(fk_tenant);

    // Renvoie la liste des membres
    res.json(users);
  } catch (err) {
    console.error("Erreur getMembres:", err);
    res.status(500).json({ error: "Erreur serveur." });
  }
};

// GET /api/membres/:id
// Récupère un membre spécifique de la jeunesse du responsable
exports.getMembreById = async (req, res) => {
  try {
    const pk_users = req.params.id; // ID extrait de l’URL
    const { fk_tenant } = req.user;

    // Vérifie que le membre demandé appartient bien à la même jeunesse
    const user = await userService.getUserById(pk_users, fk_tenant);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    // 📤 Renvoie le membre trouvé
    res.status(200).json(user);
  } catch (err) {
    console.error("Erreur getMembreById:", err);
    res.status(500).json({ error: err.message });
  }
};

// POST /api/membres
// Crée un nouveau membre dans la même jeunesse que le responsable
exports.createMembre = async (req, res) => {
  try {
    // Injecte le fk_tenant depuis l'utilisateur connecté (sécurisé)
    const body = {
      ...req.body,
      fk_tenant: req.user.fk_tenant,
    };

    const newUser = await userService.createUser(body);
    res.status(201).json({ newUser });
  } catch (err) {
    console.error("Erreur createMembre:", err);
    res.status(400).json({ error: err.message });
  }
};

// DELETE /api/membres/:id
// Supprime un membre de la jeunesse du responsable
exports.deleteMembre = async (req, res) => {
  try {
    const pk_users = req.params.id;
    const { fk_tenant } = req.user;

    // Supprime uniquement si le membre appartient à la même jeunesse
    const result = await userService.deleteUser(pk_users, fk_tenant);
    res.status(200).json({ message: "Membre supprimé", result });
  } catch (err) {
    console.error("Erreur deleteMembre:", err);
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/membres/:id
// Modifie les informations d’un membre de la même jeunesse
exports.editMembre = async (req, res) => {
  try {
    const pk_users = req.params.id;
    const { fk_tenant } = req.user;

    const updatedUser = await userService.updateUser(
      pk_users,
      fk_tenant,
      req.body
    );

    res.status(200).json({ updatedUser });
  } catch (err) {
    console.error("Erreur editMembre:", err);
    res.status(400).json({ error: err.message });
  }
};
