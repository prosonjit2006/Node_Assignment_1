const express = require("express");
const CategoryController = require("../controller/category.controller");
const router = express.Router();
const controller = new CategoryController();

router.get("/", controller.getAllCategory);
router.get("/:id", controller.getCategoryByID);
router.post("/", controller.createCategoryApi);
router.patch("/:id", controller.updateCategoryApi);
router.delete("/:id", controller.deleteCategoryApi);

module.exports = router;
