const Customer = require("../../models/customerModel");
const bcrypt = require("../../utils/bcrypt");
// const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Helper to generate JWT token
const generateToken = (customer) => {
  return jwt.sign(
    { id: customer._id, email: customer.email, phone: customer.phone },
    process.env.JWT_SECRET
  );
};

exports.customerSignup = async (req, res) => {
  try {
    const { name, country, phone, email, password } = req.body;

    // Validate required fields
    if (!name || !country || !phone || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    // Check for existing email or phone
    const existingUser = await Customer.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Customer with this email or phone already exists",
      });
    }

    // validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email",
      });
    }

    //  Validate phone format ( 10-digit validation)
    const phoneRegex = /^[6-9]\d{9}$/; 
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hashPassword(password);

    // Create new customer
    const customer = await Customer.create({
      firstName: name,
      country,
      phone,
      email,
      password: hashedPassword,
    });

    const token = generateToken(customer);

    res.status(201).json({
      success: true,
      message: "Customer registered successfully",
      token,
      data: {
        id: customer._id,
        name: customer.firstName,
        email: customer.email,
        phone: customer.phone,
      },
    });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

exports.customerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }

    // Find customer by email
    const customer = await Customer.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!customer) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    }

      if (customer.isActive === false) {
      return res
        .status(401)
        .json({ success: false, message: "Customer is Inactive" });
    }

    // Compare password
    const isMatch = await bcrypt.comparePassword(password, customer.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = generateToken(customer);

    // Update last login timestamp
    customer.lastLoginAt = new Date();
    await customer.save();

    // Send response
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      data: {
        id: customer._id,
        name: customer.firstName,
        email: customer.email,
        phone: customer.phone,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

exports.getCustomerProfile = async (req, res) => {
  try {
    const customerId = req.user.id;

    const customer = await Customer.findById(customerId)

    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Customer profile fetched successfully",
      data: customer,
    });
  } catch (error) {
    console.error("Error fetching customer profile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch customer profile",
      error: error.message,
    });
  }
};

exports.updateCustomerProfile = async (req, res) => {
  try {
    const customerId = req.user.id;
    const updates = req.body;

    
    const disallowed = ["_id", "phone", "email", "password", "isDeleted"];
    disallowed.forEach((field) => delete updates[field]);

    const updatedCustomer = await Customer.findByIdAndUpdate(
      customerId,
      { $set: updates },
      { new: true, runValidators: true }
    )

    if (!updatedCustomer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Customer profile updated successfully",
      data: updatedCustomer,
    });
  } catch (error) {
    console.error("Error updating customer profile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
};