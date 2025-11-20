const customerModel = require("../../models/customerModel");

const jwt = require("jsonwebtoken");

// Helper to generate JWT token
const generateToken = (customer) => {
  return jwt.sign(
    { id: customer._id, phone: customer.phone },
    process.env.JWT_SECRET
  );
};

// Send OTP
exports.sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone)
      return res
        .status(400)
        .json({ success: false, message: "Phone is required" });

    let customer = await customerModel.findOne({ phone });
    if (!customer) customer = await customerModel.create({ phone });

    const otp = 123456;
    customer.otp = otp;
    customer.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins
    await customer.save();

    res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Verify OTP
exports.verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp)
      return res
        .status(400)
        .json({ success: false, message: "Phone and OTP required" });

    const customer = await customerModel.findOne({ phone });
    if (!customer)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    if (customer.otp !== otp)
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    if (customer.otpExpiresAt < new Date())
      return res.status(400).json({ success: false, message: "OTP expired" });

    customer.otp = null;
    customer.otpExpiresAt = null;

     // Generate JWT token
    const token = generateToken(customer);

    // Update last login timestamp
    customer.lastLoginAt = new Date();
    await customer.save();

    res
      .status(200)
      .json({ success: true, message: "OTP verified successfully", customer,token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
