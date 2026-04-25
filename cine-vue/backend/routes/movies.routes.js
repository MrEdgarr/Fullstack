const express = require("express");
const router = express.Router();
const moviesController = require("../controllers/movies.controller");

router.get("/", moviesController.getAll);
router.get("/:id", moviesController.getById);

router.post("/", moviesController.create);
router.put("/:id", moviesController.update);
router.delete("/:id", moviesController.delete);

module.exports = router;
