
const User = require("../../models/userModel");
const { hashPassword } = require("../../utils/bcrypt");

const createUser = async (req, res) => {
  try {
    const { name, email, phone, role, status, permissions } = req.body;
    if (!name || !email || !role || !phone || !permissions) {
      return res
        .status(400)
        .json({ success: false, message: "Details Missing" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User Already Exist" });
    }

    // const hashedPassword = await hashPassword(password);

    const user = new User({
      name,
      email,
      phone,
      role,
      status,
      permissions
    });

    await user.save();
    return res
      .status(200)
      .json({ success: true, message: "User Created Successfully" });
  } catch (error) {
    console.log(error);
    res
      .status(error.status || 500)
      .json({ success: false, message: error.message });
  }
};

const getUserById = async (req, res) => {
  const id = req.params;
  console.log(id);

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "No user Found" });
    }

    return res.status(200).json({ success: true, message: "User Fetched", user });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.message);
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    console.log(users);
    if (!users || users.length === 0) {
      return res
        .status(200)
        .json({ success: true, message: "No Users Available", users: [] });
    }

    return res
      .status(200)
      .json({ success: true, message: "Users Found", users });
  } catch (error) {
    console.log(error);
    res
      .status(error.status || 500)
      .json({ success: false, message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const data = req.body;
    console.log('userId', userId)

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User Id Missing",
      });
    }

    const user = await User.findByIdAndUpdate(userId, data, { new: true });

    if (!user) {
      res.status(404).json({ success: false, message: "User Not Found" });
    }

    res
      .status(200)
      .json({ success: true, message: "User updated Successfully", user });
  } catch (error) {
    console.log(error);
    res
      .status(error.status || 500)
      .json({ success: false, message: error.message });
  }
};

const softDeleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        isDeleted: true,
        deletedAt: new Date(),
      },
      { new: true }
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      message: "User Deleted",
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createUser, getUserById, getAllUsers, updateUser, softDeleteUser };
