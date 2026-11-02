import express from "express";
import * as combosController from "./combos.controller.js";

const router = express.Router();

router.get("/", combosController.getActive);

export default router;
