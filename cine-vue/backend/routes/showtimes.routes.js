const express = require("express");
const router = express.Router();
const showtimeController = require("../controllers/showtime.controller");

router.get("/", showtimeController.getAll);
router.get("/movie/:movieId", showtimeController.getByMovie);

router.post("/", showtimeController.create);
router.put("/:id", showtimeController.update);
router.delete("/:id", showtimeController.delete);

module.exports = router;
