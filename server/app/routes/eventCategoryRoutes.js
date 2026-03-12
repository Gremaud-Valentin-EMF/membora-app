const express = require("express");
const router = express.Router();
const eventCategoryController = require("../controllers/eventCategoryController");
const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");

/**
 * @swagger
 * tags:
 *   name: Event Categories
 *   description: Gestion des catégories d'événements
 */

/**
 * @swagger
 * /event-categories:
 *   get:
 *     summary: Liste toutes les catégories d'événements
 *     tags: [Event Categories]
 *     security: [ { bearerAuth: [] } ]
 *     responses:
 *       200:
 *         description: Liste des catégories d'événements
 *   post:
 *     summary: Crée une catégorie d'événement
 *     tags: [Event Categories]
 *     security: [ { bearerAuth: [] } ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Catégorie créée
 */

/**
 * @swagger
 * /event-categories/{id}:
 *   get:
 *     summary: Récupère une catégorie d'événement par son id
 *     tags: [Event Categories]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Détail de la catégorie
 *       404:
 *         description: Catégorie non trouvée
 *   put:
 *     summary: Met à jour une catégorie d'événement
 *     tags: [Event Categories]
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
 *         description: Catégorie mise à jour
 *   delete:
 *     summary: Supprime une catégorie d'événement
 *     tags: [Event Categories]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Catégorie supprimée
 */

router.get("/", auth, eventCategoryController.getAll);
router.get("/:id", auth, eventCategoryController.getById);
router.post(
  "/",
  auth,
  role(["responsable", "sous-admin"]),
  eventCategoryController.create
);
router.put(
  "/:id",
  auth,
  role(["responsable", "sous-admin"]),
  eventCategoryController.update
);
router.delete(
  "/:id",
  auth,
  role(["responsable", "sous-admin"]),
  eventCategoryController.delete
);

module.exports = router;
