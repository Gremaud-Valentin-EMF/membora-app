const express = require("express");
const router = express.Router();
const categorieController = require("../controllers/categorieController");
const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Gestion des catégories d'événements
 */

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Liste toutes les catégories
 *     tags: [Categories]
 *     security: [ { bearerAuth: [] } ]
 *     responses:
 *       200:
 *         description: Liste des catégories
 *   post:
 *     summary: Crée une catégorie
 *     tags: [Categories]
 *     security: [ { bearerAuth: [] } ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Catégorie créée
 */

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Récupère une catégorie par son id
 *     tags: [Categories]
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
 *     summary: Met à jour une catégorie
 *     tags: [Categories]
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
 *     summary: Supprime une catégorie
 *     tags: [Categories]
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

router.get("/", auth, categorieController.getAll);
router.get("/:id", auth, categorieController.getById);
router.post("/", auth, role(["sous-admin"]), categorieController.create);
router.put("/:id", auth, role(["sous-admin"]), categorieController.update);
router.delete("/:id", auth, role(["sous-admin"]), categorieController.delete);

module.exports = router;
