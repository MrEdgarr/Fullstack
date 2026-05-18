const express = require("express");
const brandsController = require("./brands.controller");
const authMiddleware = require("../../shared/middleware/auth");
const requireRole = require("../../shared/middleware/role");
const validate = require("../../shared/middleware/validate");
const { brandSchema } = require("./brands.validation");

const router = express.Router();
const adminOnly = requireRole(["admin"]);

router.get("/", brandsController.getAll);
router.get("/:id", brandsController.getById);
router.use(authMiddleware);
router.post("/", adminOnly, validate(brandSchema), brandsController.create);
router.put("/:id", adminOnly, validate(brandSchema), brandsController.update);
router.delete("/:id", adminOnly, brandsController.delete);

module.exports = router;
