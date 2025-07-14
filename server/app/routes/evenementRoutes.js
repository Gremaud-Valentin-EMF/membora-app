const express = require("express");
const router = express.Router();
const evenementController = require("../controllers/evenementController");
const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");

/**
 * @swagger
 * tags:
 *   name: Evenements
 *   description: Gestion des événements
 */

/**
 * @swagger
 * /evenements:
 *   get:
 *     summary: Liste tous les événements
 *     tags: [Evenements]
 *     security: [ { bearerAuth: [] } ]
 *     responses:
 *       200:
 *         description: Liste des événements
 *   post:
 *     summary: Crée un événement
 *     tags: [Evenements]
 *     security: [ { bearerAuth: [] } ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Evénement créé
 */

/**
 * @swagger
 * /evenements/{id}:
 *   get:
 *     summary: Récupère un événement par son id
 *     tags: [Evenements]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Détail de l'événement
 *       404:
 *         description: Evénement non trouvé
 *   put:
 *     summary: Met à jour un événement
 *     tags: [Evenements]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Evénement mis à jour
 *   delete:
 *     summary: Supprime un événement
 *     tags: [Evenements]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Evénement supprimé
 */

/**
 * @swagger
 * /evenements/categorie/{categorie_id}:
 *   get:
 *     summary: Liste les événements d'une catégorie
 *     tags: [Evenements]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: categorie_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liste des événements de la catégorie
 */

router.get("/", auth, evenementController.getAll);
router.get("/:id", auth, evenementController.getById);
router.post(
  "/",
  auth,
  role(["responsable", "sous-admin"]),
  evenementController.create
);
router.put(
  "/:id",
  auth,
  role(["responsable", "sous-admin"]),
  evenementController.update
);
router.delete(
  "/:id",
  auth,
  role(["responsable", "sous-admin"]),
  evenementController.delete
);
router.get(
  "/categorie/:categorie_id",
  auth,
  evenementController.getByCategorie
);

module.exports = router;
