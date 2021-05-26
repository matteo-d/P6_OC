const express = require("express");
const router = express.Router();
const userCtrl = require("../controllers/user");


router.post("/signup",  userCtrl.signup);
router.post("/signup",  userCtrl.login);

module.exports = router;
