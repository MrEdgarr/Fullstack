const express = require("express");
const cinemasController = require("./cinemas.controller");
const authMiddleware = require("../../shared/middleware/auth");
const requireRole = require("../../shared/middleware/role");
const validate = require("../../shared/middleware/validate");
const { cinemaSchema } = require("./cinemas.validation");

const router = express.Router();
const adminOnly = requireRole(["admin"]);

router.get("/", cinemasController.getAll);
router.get("/:id", cinemasController.getById);
router.use(authMiddleware);
router.post("/", adminOnly, validate(cinemaSchema), cinemasController.create);
router.put("/:id", adminOnly, validate(cinemaSchema), cinemasController.update);
router.delete("/:id", adminOnly, cinemasController.delete);

module.exports = router;
