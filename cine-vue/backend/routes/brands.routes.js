const express = require("express");
const router = express.Router();
const brandsController = require("../controllers/brands.controller");

router.get("/", brandsController.getAll);
router.get("/:id", brandsController.getById);

// Protected - Admin only

router.post("/", brandsController.create);
router.put("/:id", brandsController.update);
router.delete("/:id", brandsController.delete);

module.exports = router;
