const express = require("express");
const moviesController = require("./movies.controller");
const { upload } = require("../../shared/middleware/upload-cloudinary");
const authMiddleware = require("../../shared/middleware/auth");
const requireRole = require("../../shared/middleware/role");
const validate = require("../../shared/middleware/validate");
const { movieSchema } = require("./movies.validation");

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
router.delete("/:id", adminOnly, moviesController.delete);

module.exports = router;
