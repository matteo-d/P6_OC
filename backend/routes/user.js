const express = require("express");
const router = express.Router();
const userCtrl = require("../controllers/user");
const rateLimit = require("express-rate-limit");
const apiLimiter = rateLimit({ // Limit login request to avoid brute force hack 
    windowMs: 1 * 60 * 1000,
    max: 10,
});

router.post("/signup", userCtrl.signup);
router.post("/login", apiLimiter, userCtrl.login);

module.exports = router;
