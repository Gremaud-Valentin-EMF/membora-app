const express = require("express");
const router = express.Router();
const participationController = require("../controllers/participationController");
const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");

/**
 * @swagger
 * tags:
 *   name: Participations
 *   description: Gestion des participations aux événements
 */

/**
 * @swagger
 * /participations:
 *   get:
 *     summary: Liste toutes les participations
 *     tags: [Participations]
 *     security: [ { bearerAuth: [] } ]
 *     responses:
 *       200:
 *         description: Liste des participations
 *   post:
 *     summary: Ajoute une participation
 *     tags: [Participations]
 *     security: [ { bearerAuth: [] } ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Participation ajoutée
 */

/**
 * @swagger
 * /participations/membre/{membre_id}:
 *   get:
 *     summary: Liste les participations d'un membre
 *     tags: [Participations]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: membre_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liste des participations du membre
 */

/**
 * @swagger
 * /participations/evenement/{evenement_id}:
 *   get:
 *     summary: Liste les participations à un événement
 *     tags: [Participations]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: evenement_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liste des participations à l'événement
 */

/**
 * @swagger
 * /participations/{id}:
 *   delete:
 *     summary: Supprime une participation
 *     tags: [Participations]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Participation supprimée
 */

router.get("/", auth, participationController.getAll);
router.get("/membre/:membre_id", auth, participationController.getByMembre);
router.get(
  "/evenement/:evenement_id",
  auth,
  participationController.getByEvenement
);
router.post(
  "/",
  auth,
  role(["responsable", "sous-admin"]),
  participationController.create
);
router.delete(
  "/:id",
  auth,
  role(["responsable", "sous-admin"]),
  participationController.delete
);

module.exports = router;
