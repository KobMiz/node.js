const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    console.log("No Authorization header provided.");
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const token = authHeader.split(" ")[1];
    if (!token) {
      console.log("Token is missing in Authorization header.");
      return res
        .status(401)
        .json({ error: "Access denied. Invalid token format." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token payload:", decoded);

    req.user = decoded;

    next();
  } catch (err) {
    console.error("Token verification error:", err.message);
    res.status(400).json({ error: "Invalid token." });
  }
};

module.exports = authMiddleware;
