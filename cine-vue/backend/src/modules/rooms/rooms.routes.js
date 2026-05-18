const express = require("express");
const roomsController = require("./rooms.controller");
const authMiddleware = require("../../shared/middleware/auth");
const requireRole = require("../../shared/middleware/role");
const validate = require("../../shared/middleware/validate");
const { roomCreateSchema, roomUpdateSchema } = require("./rooms.validation");

const router = express.Router();
const adminOnly = requireRole(["admin"]);

router.get("/", roomsController.getAll);
router.get("/:id", roomsController.getById);
router.use(authMiddleware);
router.post("/", adminOnly, validate(roomCreateSchema), roomsController.create);
router.put("/:id", adminOnly, validate(roomUpdateSchema), roomsController.update);
router.delete("/:id", adminOnly, roomsController.delete);

module.exports = router;
