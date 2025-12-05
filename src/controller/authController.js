const User = require("../models/userModel");
const { hashPassword, comparePassword } = require("../utils/bcrypt");
const { generateToken } = require("../utils/jwt");
const axios = require("axios");

const register = async (req, res) => {
  console.log(req.body);
  const { name, email, password, role, phone } = req.body;

  try {
    if (!name || !email || !password || !role) {
      return res
        .status(400)
        .json({ success: false, message: "Details Missing" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "User Already Registered ! Please Login",
      });
    }

    const hashedPassword = await hashPassword(password);
    console.log(hashedPassword);
    const admin = new User({
      name,
      email,
      password: hashedPassword,
      role,
      phone,
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
  console.log(req.body);

  const getIP = (req) =>
    req.headers["x-forwarded-for"]?.split(",")[0] || req.ip;

  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Details Missing" });
    }

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Credentials !" });
    }

    const hashedPassword = existingUser?.password;
    const checkPass = await comparePassword(password, hashedPassword);

    if (!checkPass) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Credentials !" });
    }

    console.log('existingUser' , existingUser)

    if (existingUser?.role !== "admin") {
      return res.status(403).json({ success: false, message: "Forbidden !" });
    }

    const payload = {
      _id: existingUser?._id,
      email: existingUser?.email,
      role: existingUser?.role,
    };

    const token = await generateToken(payload);

    if (!token) {
      console.log("Token Not Generated");
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }

    // 2️⃣ Get IP
    const ip = getIP(req);

    // 3️⃣ Get approximate location
    const loc = await axios.get(`https://ipapi.co/${ip}/json/`);
    console.log(loc);
    const locationData = {
      ip,
      city: loc.data.city,
      region: loc.data.region,
      country: loc.data.country_name,
      timezone: loc.data.timezone,
      loginAt: new Date(),
    };

    existingUser.location = locationData;
    await existingUser.save();

    return res
      .status(200)
      .json({ success: true, message: "Login Successful !", token });
  } catch (error) {
    return res
      .status(error.status || 500)
      .json({ success: false, message: error.message });
  }
};

const getMyProfile = async (req, res) => {
  try {
    console.log("My profile", req.user);
    const user = await User.findById(req.user);

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "No Profile Found" });
    }

    console.log(user);

    return res
      .status(200)
      .json({ success: true, message: "User Fetched", user });
  } catch (error) {
    return res
      .status(error.status || 500)
      .json({ success: false, message: error.message });
  }
};

module.exports = { register, login, getMyProfile };
