const express = require("express");
const router = express.Router();
const tenantController = require("../controllers/tenantController");
const auth = require("../middlewares/authMiddleware");
const role = require("../middlewares/roleMiddleware");

/**
 * @swagger
 * tags:
 *   name: Tenants
 *   description: Gestion des organisations/tenants
 */

/**
 * @swagger
 * /tenants:
 *   get:
 *     summary: Liste tous les tenants
 *     tags: [Tenants]
 *     security: [ { bearerAuth: [] } ]
 *     responses:
 *       200:
 *         description: Liste des tenants
 *   post:
 *     summary: Crée un tenant
 *     tags: [Tenants]
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
 *               logo_url:
 *                 type: string
 *               primary_color:
 *                 type: string
 *               secondary_color:
 *                 type: string
 *               slug:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tenant créé
 */

/**
 * @swagger
 * /tenants/{id}:
 *   get:
 *     summary: Récupère un tenant par son id
 *     tags: [Tenants]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Détail du tenant
 *       404:
 *         description: Tenant non trouvé
 *   put:
 *     summary: Met à jour un tenant
 *     tags: [Tenants]
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
 *         description: Tenant mis à jour
 *   delete:
 *     summary: Supprime un tenant
 *     tags: [Tenants]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Tenant supprimé
 */

/**
 * @swagger
 * /tenants/slug/{slug}:
 *   get:
 *     summary: Récupère un tenant par son slug (accès public)
 *     tags: [Tenants]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détail du tenant
 *       404:
 *         description: Tenant non trouvé
 */

router.get("/", auth, role(["sous-admin"]), tenantController.getAll);
router.get("/:id", auth, tenantController.getById);
router.get("/slug/:slug", tenantController.getBySlug); // Route publique
router.post("/", auth, role(["sous-admin"]), tenantController.create);
router.put("/:id", auth, role(["sous-admin"]), tenantController.update);
router.delete("/:id", auth, role(["sous-admin"]), tenantController.delete);

module.exports = router;
