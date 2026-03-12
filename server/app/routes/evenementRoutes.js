const express = require("express");
const router = express.Router();
const evenementController = require("../controllers/evenementController");
const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");
const evenementService = require("../services/evenementService");

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

/**
 * @swagger
 * /evenements/{id}/annuler:
 *   put:
 *     summary: Annule un événement
 *     description: Change le statut d'un événement de "planifié" ou "en cours" à "annulé"
 *     tags: [Evenements]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'événement à annuler
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Body vide (optionnel)
 *     responses:
 *       200:
 *         description: Événement annulé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: ID de l'événement
 *                 nom:
 *                   type: string
 *                   description: Nom de l'événement
 *                 statut:
 *                   type: string
 *                   enum: [annulé]
 *                   description: Nouveau statut de l'événement
 *                 date:
 *                   type: string
 *                   format: date-time
 *                   description: Date de l'événement
 *                 updated_at:
 *                   type: string
 *                   format: date-time
 *                   description: Date de dernière modification
 *       400:
 *         description: Erreur lors de l'annulation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Message d'erreur
 *       401:
 *         description: Token d'authentification manquant ou invalide
 *       403:
 *         description: Accès refusé - rôle insuffisant
 *       404:
 *         description: Événement non trouvé
 */

/**
 * @swagger
 * /evenements/{id}/reactiver:
 *   put:
 *     summary: Réactive un événement
 *     description: Change le statut d'un événement de "annulé" à "planifié"
 *     tags: [Evenements]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'événement à réactiver
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Body vide (optionnel)
 *     responses:
 *       200:
 *         description: Événement réactivé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: ID de l'événement
 *                 nom:
 *                   type: string
 *                   description: Nom de l'événement
 *                 statut:
 *                   type: string
 *                   enum: [planifié]
 *                   description: Nouveau statut de l'événement
 *                 date:
 *                   type: string
 *                   format: date-time
 *                   description: Date de l'événement
 *                 updated_at:
 *                   type: string
 *                   format: date-time
 *                   description: Date de dernière modification
 *       400:
 *         description: Erreur lors de la réactivation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Message d'erreur
 *       401:
 *         description: Token d'authentification manquant ou invalide
 *       403:
 *         description: Accès refusé - rôle insuffisant
 *       404:
 *         description: Événement non trouvé
 */

/**
 * @swagger
 * /evenements/{id}/inscrire:
 *   post:
 *     summary: Inscrit un membre à un événement social
 *     description: Inscrit directement un membre à un événement social (sans planning de tranches horaires)
 *     tags: [Evenements]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'événement social
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - membre_id
 *             properties:
 *               membre_id:
 *                 type: integer
 *                 description: ID du membre à inscrire
 *     responses:
 *       200:
 *         description: Inscription réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: ID de l'inscription
 *                 evenement_id:
 *                   type: integer
 *                   description: ID de l'événement
 *                 membre_id:
 *                   type: integer
 *                   description: ID du membre
 *                 date_inscription:
 *                   type: string
 *                   format: date-time
 *                   description: Date d'inscription
 *       400:
 *         description: Erreur lors de l'inscription
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Message d'erreur
 *       401:
 *         description: Token d'authentification manquant ou invalide
 *       404:
 *         description: Événement ou membre non trouvé
 *       409:
 *         description: Le membre est déjà inscrit à cet événement
 */

/**
 * @swagger
 * /evenements/{id}/inscrire/{membreId}:
 *   delete:
 *     summary: Désinscrit un membre d'un événement social
 *     description: Supprime l'inscription directe d'un membre à un événement social
 *     tags: [Evenements]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'événement social
 *         schema:
 *           type: integer
 *       - in: path
 *         name: membreId
 *         required: true
 *         description: ID du membre à désinscrire
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Désinscription réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Message de confirmation
 *       400:
 *         description: Erreur lors de la désinscription
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Message d'erreur
 *       401:
 *         description: Token d'authentification manquant ou invalide
 *       404:
 *         description: Inscription non trouvée
 */

/**
 * @swagger
 * /evenements/{id}/participants:
 *   get:
 *     summary: Liste les participants d'un événement social
 *     description: Récupère la liste de tous les participants inscrits directement à un événement social
 *     tags: [Evenements]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'événement social
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liste des participants
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID de l'inscription
 *                   evenement_id:
 *                     type: integer
 *                     description: ID de l'événement
 *                   membre_id:
 *                     type: integer
 *                     description: ID du membre
 *                   date_inscription:
 *                     type: string
 *                     format: date-time
 *                     description: Date d'inscription
 *                   membre_nom:
 *                     type: string
 *                     description: Nom du membre
 *                   membre_prenom:
 *                     type: string
 *                     description: Prénom du membre
 *                   membre_email:
 *                     type: string
 *                     description: Email du membre
 *       401:
 *         description: Token d'authentification manquant ou invalide
 *       404:
 *         description: Événement non trouvé
 */

/**
 * @swagger
 * /evenements/{id}/inscription/{membreId}:
 *   get:
 *     summary: Vérifie l'inscription d'un membre à un événement social
 *     description: Vérifie si un membre spécifique est inscrit directement à un événement social
 *     tags: [Evenements]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'événement social
 *         schema:
 *           type: integer
 *       - in: path
 *         name: membreId
 *         required: true
 *         description: ID du membre à vérifier
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Inscription trouvée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: ID de l'inscription
 *                 evenement_id:
 *                   type: integer
 *                   description: ID de l'événement
 *                 membre_id:
 *                   type: integer
 *                   description: ID du membre
 *                 date_inscription:
 *                   type: string
 *                   format: date-time
 *                   description: Date d'inscription
 *       401:
 *         description: Token d'authentification manquant ou invalide
 *       404:
 *         description: Inscription non trouvée (membre non inscrit)
 */

router.get("/", auth, evenementController.getAll);
router.get("/upcoming", auth, evenementController.getUpcoming);
router.get(
  "/categorie/:categorie_id",
  auth,
  evenementController.getByCategorie
);
router.get(
  "/event-category/:event_category_id",
  auth,
  evenementController.getByEventCategory
);
router.post(
  "/",
  auth,
  role(["responsable", "sous-admin"]),
  evenementController.create
);

// Routes pour l'inscription directe aux événements sociaux - AVANT /:id
router.post("/:id/inscrire", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { membre_id } = req.body;
    const inscription = await evenementService.inscrireMembreEvent(
      id,
      membre_id
    );
    res.json(inscription);
  } catch (error) {
    console.error("Error inscrire membre event:", error);
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id/inscrire/:membreId", auth, async (req, res) => {
  try {
    const { id, membreId } = req.params;
    await evenementService.desinscrireMembreEvent(id, membreId);
    res.json({ message: "Désinscription réussie" });
  } catch (error) {
    console.error("Error desinscrire membre event:", error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id/participants", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const participants = await evenementService.getEventParticipants(id);
    res.json(participants);
  } catch (error) {
    console.error("Error get event participants:", error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id/inscription/:membreId", auth, async (req, res) => {
  try {
    const { id, membreId } = req.params;
    const inscription = await evenementService.getUserEventInscription(
      id,
      membreId
    );
    res.json(inscription);
  } catch (error) {
    console.error("Error get user event inscription:", error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", auth, evenementController.getById);
router.put(
  "/:id",
  auth,
  role(["responsable", "sous-admin"]),
  evenementController.update
);
router.put(
  "/:id/annuler",
  auth,
  role(["responsable", "sous-admin"]),
  evenementController.cancelEvent
);
router.put(
  "/:id/reactiver",
  auth,
  role(["responsable", "sous-admin"]),
  evenementController.reactivateEvent
);
router.delete(
  "/:id",
  auth,
  role(["responsable", "sous-admin"]),
  evenementController.delete
);

module.exports = router;
