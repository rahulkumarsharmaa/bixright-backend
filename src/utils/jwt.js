const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = "1h";

const generateToken = (payload) => {
  try {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  } catch (error) {
    throw new Error("Error Generating Token");
  }
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error("Error Verifying Token");
  }
};

module.exports = { generateToken, verifyToken };
