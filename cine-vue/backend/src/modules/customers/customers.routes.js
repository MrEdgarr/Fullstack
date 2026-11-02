import express from "express";
import * as customersController from "./customers.controller.js";
import authMiddleware from "../../shared/middleware/auth.js";
import requireRole from "../../shared/middleware/role.js";
import validate from "../../shared/middleware/validate.js";
import { upload } from "../../shared/middleware/upload-cloudinary.js";
import { customerUpdateSchema } from "./customers.validation.js";

const router = express.Router();
const adminOnly = requireRole(["admin"]);

router.use(authMiddleware);
router.get("/me", customersController.getMe);
router.put(
  "/me",
  upload.single("avatar"),
  validate(customerUpdateSchema),
  customersController.updateMe,
);
router.get("/:id", adminOnly, customersController.getById);
router.put("/:id", adminOnly, validate(customerUpdateSchema), customersController.update);

export default router;
