const express = require("express");
const router = express.Router();
const seatsController = require("../controllers/seats.controller");

router.get("/room/:roomId", seatsController.getByRoom);

router.post("/", seatsController.create);
router.put("/:id/status", seatsController.updateStatus);
router.delete("/:id", seatsController.delete);

module.exports = router;
