const Admin = require("../models/adminUserModel");
const { hashPassword, comparePassword } = require("../utils/bcrypt");
const { generateToken } = require("../utils/jwt");

const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Details Missing" });
    }

    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "User Already Registered ! Please Login",
      });
    }

    const hashedPassword = await hashPassword(password);
    console.log(hashedPassword);
    const admin = new Admin({
      name,
      email,
      password: hashedPassword,
    });

    await admin.save();
    return res.status(200).json({
      success: true,
      message: "User Registered Successfully ! Please Login",
    });
  } catch (error) {
    console.log("SignUp Error", error);
    res
      .status(error.status || 500)
      .json({ success: false, message: error.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Details Missing" });
    }

    const existingUser = await Admin.findOne({ email });

    if (!existingUser) {
      res
        .status(400)
        .json({ success: false, message: "Invalid Credentials !" });
    }

    const hashedPassword = existingUser?.password;
    const checkPass = await comparePassword(password, hashedPassword);

    if (!checkPass) {
      res
        .status(400)
        .json({ success: false, message: "Invalid Credentials !" });
    }

    const payload = {
      _id: existingUser._id,
      email: existingUser.email,
    };

    const token = await generateToken(payload);

    if (!token) {
      console.log("Token Not Generated");
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
    return res
      .status(200)
      .json({ success: true, message: "Login Successful !", token });
  } catch (error) {
    res
      .status(error.status || 500)
      .json({ success: false, message: error.message });
  }
};

module.exports = { register, login };
