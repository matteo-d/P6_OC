const express = require("express");
const router = express.Router();
const userCtrl = require("../controllers/user");
const rateLimit = require("express-rate-limit");
const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 20,
});

router.post("/signup", userCtrl.signup);
router.post("/login", apiLimiter, userCtrl.login);

module.exports = router;
