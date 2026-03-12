const express = require("express");
const router = express.Router();
const badgeController = require("../controllers/badgeController");
const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");

/**
 * @swagger
 * tags:
 *   name: Badges
 *   description: Gestion des badges système et attributions
 */

/**
 * @swagger
 * /badges:
 *   get:
 *     summary: Liste tous les badges système
 *     tags: [Badges]
 *     security: [ { bearerAuth: [] } ]
 *     responses:
 *       200:
 *         description: Liste des badges système
 *   post:
 *     summary: Crée un badge système
 *     tags: [Badges]
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
 *               icone:
 *                 type: string
 *               couleur:
 *                 type: string
 *     responses:
 *       201:
 *         description: Badge créé
 */

/**
 * @swagger
 * /badges/{id}:
 *   get:
 *     summary: Récupère un badge par son id
 *     tags: [Badges]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Détail du badge
 *       404:
 *         description: Badge non trouvé
 *   put:
 *     summary: Met à jour un badge
 *     tags: [Badges]
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
 *         description: Badge mis à jour
 *   delete:
 *     summary: Supprime un badge
 *     tags: [Badges]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Badge supprimé
 */

/**
 * @swagger
 * /badges/{id}/attributions:
 *   get:
 *     summary: Liste les attributions d'un badge
 *     tags: [Badges]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liste des attributions du badge
 */

/**
 * @swagger
 * /badges/{id}/attribuer:
 *   post:
 *     summary: Attribue un badge à un membre
 *     tags: [Badges]
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
 *             properties:
 *               membre_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Badge attribué
 */

/**
 * @swagger
 * /badges/attributions/{attribution_id}:
 *   delete:
 *     summary: Retire l'attribution d'un badge
 *     tags: [Badges]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: attribution_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Attribution supprimée
 */

// Routes pour les badges système
router.get("/", auth, badgeController.getAllBadges);

// Route pour récupérer les badges d'un membre
router.get("/membre/:membreId", auth, badgeController.getMembreBadges);
router.get("/:id", auth, badgeController.getBadgeById);
router.post("/", auth, role(["sous-admin"]), badgeController.createBadge);
router.put("/:id", auth, role(["sous-admin"]), badgeController.updateBadge);
router.delete("/:id", auth, role(["sous-admin"]), badgeController.deleteBadge);

// Routes pour les attributions
router.get("/:id/attributions", auth, badgeController.getBadgeAttributions);
router.post(
  "/:id/attribuer",
  auth,
  role(["sous-admin"]),
  badgeController.attribuerBadge
);
router.delete(
  "/attributions/:attribution_id",
  auth,
  role(["sous-admin"]),
  badgeController.retirerAttribution
);

module.exports = router;
