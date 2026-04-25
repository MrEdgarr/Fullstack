const express = require("express");
const router = express.Router();
const screeningRoomsController = require("../controllers/screeningRooms.controller");

router.get("/", screeningRoomsController.getAll);
router.get("/:id", screeningRoomsController.getById);

router.post("/",   screeningRoomsController.create);
router.put("/:id",   screeningRoomsController.update);
router.delete("/:id", screeningRoomsController.delete);

module.exports = router;
