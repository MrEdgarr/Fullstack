import express from "express";
import * as brandsController from "./brands.controller.js";
import authMiddleware from "../../shared/middleware/auth.js";
import requireRole from "../../shared/middleware/role.js";
import validate from "../../shared/middleware/validate.js";
import { brandSchema } from "./brands.validation.js";

const router = express.Router();
const adminOnly = requireRole(["admin"]);

router.get("/", brandsController.getAll);
router.get("/:id", brandsController.getById);
router.use(authMiddleware);
router.post("/", adminOnly, validate(brandSchema), brandsController.create);
router.put("/:id", adminOnly, validate(brandSchema), brandsController.update);
router.delete("/:id", adminOnly, brandsController.remove);

export default router;
