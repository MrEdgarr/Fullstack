const express = require("express");
const router = express.Router();
const cinemasController = require("../controllers/cinemas.controller");

router.get("/", cinemasController.getAll);
router.get("/:id", cinemasController.getById);

router.post("/", cinemasController.create);
router.put("/:id", cinemasController.update);
router.delete("/:id", cinemasController.delete);

module.exports = router;
