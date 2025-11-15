const { verifyToken } = require("../utils/jwt");

const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      console.log("Access Token not Provided");
      return res
        .status(401)
        .json({ success: false, message: "Access Token not Provided" });
    }
    console.log("token", token);

    const verifiedToken = await verifyToken(token);
    console.log(verifiedToken);

    if (!verifiedToken) {
      console.log("Invalid Token");
      return res.status(401).json({ success: false, message: "Invalid Token" });
    }

    req.user = verifiedToken._id;
    console.log(req.user)

    next()
  } catch (error) {
    console.log(error);
    throw new Error("Token Validation Error");
  }
};

module.exports = { authenticateUser };
