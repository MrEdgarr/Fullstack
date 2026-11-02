import express from "express";
import * as authController from "./auth.controller.js";
import validate from "../../shared/middleware/validate.js";
import { registerSchema, loginSchema } from "./auth.validation.js";

const router = express.Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);

export default router;
