const express = require("express");
const router = express.Router();
const userCtrl = require("../controllers/user");
const auth = require("../middleware/auth");

router.post("/signup", auth, userCtrl.signup);
router.post("/signup", auth, userCtrl.login);

module.exports = router;
