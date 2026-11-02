import express from "express";
import * as moviesController from "./movies.controller.js";
import { upload } from "../../shared/middleware/upload-cloudinary.js";
import authMiddleware from "../../shared/middleware/auth.js";
import requireRole from "../../shared/middleware/role.js";
import validate from "../../shared/middleware/validate.js";
import { movieSchema } from "./movies.validation.js";

const router = express.Router();
const adminOnly = requireRole(["admin"]);

router.get("/", moviesController.getAll);
router.get("/now-showing", moviesController.getNowShowing);
router.get("/upcoming", moviesController.getUpcoming);
router.get("/status/:status", moviesController.getByStatus);
router.get("/:id", moviesController.getById);

router.use(authMiddleware);
router.post(
  "/",
  adminOnly,
  upload.fields([
    { name: "poster", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  validate(movieSchema),
  moviesController.create,
);
router.put(
  "/:id",
  adminOnly,
  upload.fields([
    { name: "poster", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  validate(movieSchema),
  moviesController.update,
);
router.delete("/:id", adminOnly, moviesController.remove);

export default router;
