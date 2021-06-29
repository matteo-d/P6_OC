const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const sauceCtrl = require('../controllers/sauce');
const rateLimit = require("express-rate-limit"); // Limiter le nombre de requetes login / éviter brute force 
const apiLimiter = rateLimit({ // Max 5 tentative toutes les 3mins 
    windowMs: 1 * 60 * 1000, 
    max: 5
  });
router.post('/',apiLimiter,  auth, multer, sauceCtrl.createSauce); // auth avant multer et controller car on vérifie d'abord
// que l'utilisateur est ok avant de l'autoriser a faire des modifs
router.get('/',apiLimiter, auth, sauceCtrl.getAllSauces);
router.get('/:id',apiLimiter, auth, sauceCtrl.getOneSauce);
router.put('/:id',apiLimiter, auth,  multer, sauceCtrl.modifySauce);
router.delete('/:id',apiLimiter, auth, sauceCtrl.deleteSauce);
router.post('/:id/like',apiLimiter,  auth, sauceCtrl.likeSauce)

module.exports = router;  