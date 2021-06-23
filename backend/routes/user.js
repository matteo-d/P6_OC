const express = require("express");
const router = express.Router();
const userCtrl = require("../controllers/user");
const rateLimit = require("express-rate-limit"); // Limiter le nombre de requetes login / éviter brute force 
const apiLimiter = rateLimit({
    windowMs: 3 * 60 * 1000, // 15 minutes
    max: 5
  });
  
router.post("/signup",apiLimiter, userCtrl.signup); //  /signup = endppoint 
router.post("/login",apiLimiter, userCtrl.login);

module.exports = router;
