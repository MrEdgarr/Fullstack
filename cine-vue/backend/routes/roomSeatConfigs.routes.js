const express = require("express");
const router = express.Router();
const roomSeatConfigsController = require("../controllers/roomSeatConfigs.controller");

router.get("/:roomId", roomSeatConfigsController.getByRoom);

router.post("/", roomSeatConfigsController.create);
router.put("/:roomId", roomSeatConfigsController.update);

module.exports = router;
