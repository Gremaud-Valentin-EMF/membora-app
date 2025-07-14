const express = require("express");
const router = express.Router();
const membreController = require("../controllers/membreController");
const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");

/**
 * @swagger
 * tags:
 *   name: Membres
 *   description: Gestion des membres et des rôles
 */

/**
 * @swagger
 * /membres:
 *   get:
 *     summary: Liste tous les membres
 *     tags: [Membres]
 *     security: [ { bearerAuth: [] } ]
 *     responses:
 *       200:
 *         description: Liste des membres
 *   post:
 *     summary: (Non utilisé, inscription via /auth/register)
 *     tags: [Membres]
 *     deprecated: true
 *     responses:
 *       501:
 *         description: Non implémenté
 */

/**
 * @swagger
 * /membres/{id}:
 *   get:
 *     summary: Récupère un membre par son id
 *     tags: [Membres]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Détail du membre
 *       404:
 *         description: Membre non trouvé
 *   put:
 *     summary: Met à jour un membre
 *     tags: [Membres]
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
 *         description: Membre mis à jour
 *   delete:
 *     summary: Supprime un membre
 *     tags: [Membres]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Membre supprimé
 */

/**
 * @swagger
 * /membres/{id}/set-responsable:
 *   post:
 *     summary: Définit un membre comme responsable
 *     tags: [Membres]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Membre promu responsable
 */

/**
 * @swagger
 * /membres/{id}/unset-responsable:
 *   post:
 *     summary: Retire le statut responsable à un membre
 *     tags: [Membres]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Membre redevenu simple membre
 */

router.get(
  "/",
  auth,
  role(["sous-admin", "responsable"]),
  membreController.getAll
);
router.get("/:id", auth, membreController.getById);
router.put("/:id", auth, membreController.update);
router.delete("/:id", auth, role(["sous-admin"]), membreController.delete);
router.post(
  "/:id/set-responsable",
  auth,
  role(["sous-admin"]),
  membreController.setResponsable
);
router.post(
  "/:id/unset-responsable",
  auth,
  role(["sous-admin"]),
  membreController.unsetResponsable
);

module.exports = router;
