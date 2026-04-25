const express = require("express");
const router = express.Router();
const brandsController = require("../controllers/brands.controller");
const authMiddleware = require("../middleware/auth");
const requireRole = require("../middleware/role");
const adminOnly = requireRole(["admin"]);
const validate = require("../middleware/validate");
const schemas = require("../validations/schemas");

router.get("/", brandsController.getAll);
router.get("/:id", brandsController.getById);

// Protected - Admin only
router.use(authMiddleware);
router.post("/", adminOnly, validate(schemas.brand), brandsController.create);
router.put("/:id", adminOnly, validate(schemas.brand), brandsController.update);
router.delete("/:id", adminOnly, brandsController.delete);

module.exports = router;
