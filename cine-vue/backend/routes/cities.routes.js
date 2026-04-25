const express = require("express");
const router = express.Router();
const citiesController = require("../controllers/cities.controller");

router.get("/", citiesController.getAll);
router.get("/:id", citiesController.getById);

router.post("/", citiesController.create);
router.put("/:id", citiesController.update);
router.delete("/:id", citiesController.delete);

module.exports = router;
