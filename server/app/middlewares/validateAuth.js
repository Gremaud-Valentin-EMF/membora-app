const jwt = require("jsonwebtoken");

const validateAuth = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  const token = authHeader && authHeader.split(" ")[1];

  console.log("Auth header reçu :", authHeader);
  console.log("Token extrait :", token);

  if (!token) return res.status(401).json({ message: "Token manquant" });

  jwt.verify(token, process.env.JWT_SECRET, (err, member) => {
    if (err)
      return res.status(403).json({ message: "token invalide ou expiré" });
    req.member = member;
    next();
  });
};

module.exports = validateAuth;
