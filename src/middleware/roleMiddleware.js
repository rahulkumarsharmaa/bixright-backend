const authorizeUser =
  (...roles) =>
  (req, res, next) => {
    try {
      if (!req.user) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }

      next(); // call next if authorized
    } catch (error) {
      console.error(error);
      next(error); // pass the error to error-handling middleware
    }
  };

module.exports = { authorizeUser };
