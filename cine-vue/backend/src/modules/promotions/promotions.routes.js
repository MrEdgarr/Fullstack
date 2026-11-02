import express from "express";
import * as promotionsController from "./promotions.controller.js";

const router = express.Router();

router.get("/:code/validate", promotionsController.validate);

export default router;
