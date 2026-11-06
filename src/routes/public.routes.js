const express = require("express");
const PublicController = require("../controller/public.controller");
const router = express.Router();
const controller = new PublicController();

router.get("/", controller.home);

module.exports = router;
