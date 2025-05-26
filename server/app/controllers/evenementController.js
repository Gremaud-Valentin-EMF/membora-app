// router.get("/", validateAuth, evenementController.getEvenements);

// router.get("/:id", validateAuth, evenementController.getEvenementById);

// router.post("/", validateAuth, evenementController.createEvenement);

// router.put("/", validateAuth, evenementController.editEvenement);

// router.delete("/", validateAuth, evenementController.deleteEvenement);

const evenementService = require("../services/evenementService");

// GET /api/evenements
// Récupère tous les événements du tenant courant
exports.getEvenements = async (req, res) => {
  try {
    const { fk_tenant } = req.user;

    // Appelle le service pour récupérer les événements liés au tenant
    const evenements = await evenementService.getEvenementsByTenant(fk_tenant);

    // Renvoie la liste
    res.status(200).json(evenements);
  } catch (err) {
    console.error("Erreur getEvenements:", err);
    res.status(500).json({ error: err.message || "Erreur serveur." });
  }
};

// GET /api/evenements/:id
// Récupère un événement grâce à son id
exports.getEvenementById = async (req, res) => {
  try {
    const result = await equipeService.deleteEquipe(req.body);
    res.status(200).json({ message: "Equipe supprimé", result });
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};

exports.createEquipe = async (req, res) => {
  try {
    const newEquipe = await equipeService.createEquipe(req.body);
    res.status(201).json({ newEquipe });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateEquipe = async (req, res) => {
  try {
    const updatedEquipe = await equipeService.updateEquipe(req.body);
    res.status(200).json({ updatedEquipe });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
