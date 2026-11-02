import express from "express";
import * as cinemasController from "./cinemas.controller.js";
import authMiddleware from "../../shared/middleware/auth.js";
import requireRole from "../../shared/middleware/role.js";
import validate from "../../shared/middleware/validate.js";
import { cinemaSchema } from "./cinemas.validation.js";

const router = express.Router();
const adminOnly = requireRole(["admin"]);

router.get("/", cinemasController.getAll);
router.get("/:id", cinemasController.getById);
router.use(authMiddleware);
router.post("/", adminOnly, validate(cinemaSchema), cinemasController.create);
router.put("/:id", adminOnly, validate(cinemaSchema), cinemasController.update);
router.delete("/:id", adminOnly, cinemasController.remove);

export default router;
