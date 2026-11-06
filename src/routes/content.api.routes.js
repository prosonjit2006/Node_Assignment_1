const express = require("express");
const ContentController = require("../controller/content.controller");
const router = express.Router();
const controller = new ContentController();

router.get("/", controller.getAllContent);
router.get("/:id", controller.getContentByID);
router.post("/", controller.createContentApi);
router.patch("/:id", controller.updateContentApi);
router.delete("/:id", controller.deleteContentApi);

module.exports = router;
