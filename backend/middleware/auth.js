const jwt = require("jsonwebtoken");
require("dotenv").config();
const TOKEN = process.env.TOKEN;

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.verify(token, `${TOKEN}`);
        const userId = decodedToken.userId;

        module.exports.userId = userId;

        next();
    } catch {
        res.status(401).json({ message: " OUPS ! Identification impossible " });
    }
};
