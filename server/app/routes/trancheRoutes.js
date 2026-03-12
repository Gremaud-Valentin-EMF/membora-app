const express = require("express");
const router = express.Router();
const trancheController = require("../controllers/trancheController");
const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");

/**
 * @swagger
 * tags:
 *   name: Tranches Horaires
 *   description: Gestion des tranches horaires et inscriptions
 */

/**
 * @swagger
 * /tranches:
 *   get:
 *     summary: Liste toutes les tranches horaires
 *     tags: [Tranches Horaires]
 *     security: [ { bearerAuth: [] } ]
 *     responses:
 *       200:
 *         description: Liste des tranches horaires
 *   post:
 *     summary: Crée une tranche horaire
 *     tags: [Tranches Horaires]
 *     security: [ { bearerAuth: [] } ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               evenement_id:
 *                 type: integer
 *               nom:
 *                 type: string
 *               debut:
 *                 type: string
 *                 format: date-time
 *               fin:
 *                 type: string
 *                 format: date-time
 *               valeur_coches:
 *                 type: integer
 *               max_participants:
 *                 type: integer
 *               description:
 *                 type: string
 *               secteur:
 *                 type: string
 *               couleur:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tranche horaire créée
 */

/**
 * @swagger
 * /tranches/{id}:
 *   get:
 *     summary: Récupère une tranche horaire par son id
 *     tags: [Tranches Horaires]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Détail de la tranche horaire
 *       404:
 *         description: Tranche horaire non trouvée
 *   put:
 *     summary: Met à jour une tranche horaire
 *     tags: [Tranches Horaires]
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
 *         description: Tranche horaire mise à jour
 *   delete:
 *     summary: Supprime une tranche horaire
 *     tags: [Tranches Horaires]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Tranche horaire supprimée
 */

/**
 * @swagger
 * /tranches/{id}/inscriptions:
 *   get:
 *     summary: Liste les inscriptions à une tranche horaire
 *     tags: [Tranches Horaires]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liste des inscriptions
 */

/**
 * @swagger
 * /tranches/{id}/inscrire:
 *   post:
 *     summary: Inscrit un membre à une tranche horaire
 *     tags: [Tranches Horaires]
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
 *         description: Membre inscrit
 */

/**
 * @swagger
 * /tranches/inscriptions/{inscription_id}:
 *   delete:
 *     summary: Désinscrit un membre d'une tranche horaire
 *     tags: [Tranches Horaires]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: inscription_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Membre désinscrit
 */

/**
 * @swagger
 * /tranches/evenement/{evenement_id}:
 *   get:
 *     summary: Liste les tranches horaires d'un événement
 *     tags: [Tranches Horaires]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: evenement_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liste des tranches horaires de l'événement
 */

// Routes pour les tranches horaires
router.get("/", auth, trancheController.getAllTranches);
router.get("/:id", auth, trancheController.getTrancheById);
router.post(
  "/",
  auth,
  role(["responsable", "sous-admin"]),
  trancheController.createTranche
);
router.put(
  "/:id",
  auth,
  role(["responsable", "sous-admin"]),
  trancheController.updateTranche
);
router.delete(
  "/:id",
  auth,
  role(["responsable", "sous-admin"]),
  trancheController.deleteTranche
);

// Routes pour les inscriptions
router.get("/:id/inscriptions", auth, trancheController.getTrancheInscriptions);
router.post("/:id/inscrire", auth, trancheController.inscrireMembre);
router.delete(
  "/inscriptions/:inscription_id",
  auth,
  trancheController.desinscrireMembre
);

// Routes spéciales
router.get(
  "/evenement/:evenement_id",
  auth,
  trancheController.getTranchesByEvenement
);

// Route pour les inscriptions d'un membre à un événement
router.get(
  "/evenement/:evenement_id/membre/:membre_id",
  auth,
  trancheController.getMembreInscriptionsByEvenement
);

// Route pour toutes les inscriptions d'un membre
router.get("/membre/:membre_id", auth, trancheController.getMembreInscriptions);

module.exports = router;
