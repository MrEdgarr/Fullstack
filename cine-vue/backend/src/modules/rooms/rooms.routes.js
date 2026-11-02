import express from "express";
import * as roomsController from "./rooms.controller.js";
import authMiddleware from "../../shared/middleware/auth.js";
import requireRole from "../../shared/middleware/role.js";
import validate from "../../shared/middleware/validate.js";
import { roomCreateSchema, roomUpdateSchema } from "./rooms.validation.js";

const router = express.Router();
const adminOnly = requireRole(["admin"]);

router.get("/", roomsController.getAll);
router.get("/:id", roomsController.getById);
router.use(authMiddleware);
router.post("/", adminOnly, validate(roomCreateSchema), roomsController.create);
router.put("/:id", adminOnly, validate(roomUpdateSchema), roomsController.update);
router.delete("/:id", adminOnly, roomsController.remove);

export default router;
