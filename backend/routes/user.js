const express = require("express");
const router = express.Router();
const userCtrl = require("../controllers/user");
const rateLimit = require("express-rate-limit"); // Limiter le nombre de requetes login / éviter brute force 
const apiLimiter = rateLimit({ // Max 5 tentative toutes les 3mins 
    windowMs: 1 * 60 * 1000, 
    max: 20
  });
  
router.post("/signup", userCtrl.signup); //  /signup = endppoint 
router.post("/login",apiLimiter, userCtrl.login);

module.exports = router;
