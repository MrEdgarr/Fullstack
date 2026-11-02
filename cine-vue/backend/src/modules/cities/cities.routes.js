import express from "express";
import * as citiesController from "./cities.controller.js";
import authMiddleware from "../../shared/middleware/auth.js";
import requireRole from "../../shared/middleware/role.js";
import validate from "../../shared/middleware/validate.js";
import { citySchema } from "./cities.validation.js";

const router = express.Router();
const adminOnly = requireRole(["admin"]);

router.get("/", citiesController.getAll);
router.get("/:id", citiesController.getById);
router.use(authMiddleware);
router.post("/", adminOnly, validate(citySchema), citiesController.create);
router.put("/:id", adminOnly, validate(citySchema), citiesController.update);
router.delete("/:id", adminOnly, citiesController.remove);

export default router;
