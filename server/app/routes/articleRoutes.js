const express = require("express");
const router = express.Router();
const articleController = require("../controllers/articleController");
const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");

/**
 * @swagger
 * tags:
 *   name: Articles
 *   description: Gestion des articles et actualités
 */

/**
 * @swagger
 * /articles/public:
 *   get:
 *     summary: Liste tous les articles publiés (public)
 *     tags: [Articles]
 *     responses:
 *       200:
 *         description: Liste des articles publiés
 */

/**
 * @swagger
 * /articles/public/{id}:
 *   get:
 *     summary: Récupère un article publié par son id (public)
 *     tags: [Articles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Détail de l'article
 *       404:
 *         description: Article non trouvé
 */

/**
 * @swagger
 * /articles:
 *   get:
 *     summary: Liste tous les articles (authentifié)
 *     tags: [Articles]
 *     security: [ { bearerAuth: [] } ]
 *     responses:
 *       200:
 *         description: Liste des articles
 *   post:
 *     summary: Crée un article
 *     tags: [Articles]
 *     security: [ { bearerAuth: [] } ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Article créé
 */

/**
 * @swagger
 * /articles/{id}:
 *   get:
 *     summary: Récupère un article par son id (authentifié)
 *     tags: [Articles]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Détail de l'article
 *       404:
 *         description: Article non trouvé
 *   put:
 *     summary: Met à jour un article
 *     tags: [Articles]
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
 *         description: Article mis à jour
 *   delete:
 *     summary: Supprime un article
 *     tags: [Articles]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Article supprimé
 */

/**
 * @swagger
 * /articles/{id}/archiver:
 *   post:
 *     summary: Archive un article
 *     tags: [Articles]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Article archivé
 */

/**
 * @swagger
 * /articles/{id}/desarchiver:
 *   post:
 *     summary: Désarchive un article
 *     tags: [Articles]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Article désarchivé
 */

// Routes publiques (sans authentification)
router.get("/public", articleController.getPublic);
router.get("/public/:id", articleController.getPublicById);

// Routes authentifiées
router.get("/", auth, articleController.getAll);
router.get("/:id", auth, articleController.getById);
router.post("/", auth, role(["sous-admin"]), articleController.create);
router.put("/:id", auth, role(["sous-admin"]), articleController.update);
router.delete("/:id", auth, role(["sous-admin"]), articleController.delete);
router.post(
  "/:id/archiver",
  auth,
  role(["sous-admin"]),
  articleController.archive
);
router.post(
  "/:id/desarchiver",
  auth,
  role(["sous-admin"]),
  articleController.unarchive
);

module.exports = router;
