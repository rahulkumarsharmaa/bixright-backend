
const User = require("../../models/userModel");
const { hashPassword } = require("../../utils/bcrypt");

const createUser = async (req, res) => {
  try {
    const { name, email, password, phone, company, package } = req.body;
    if (!name || !email || !password || !phone || !company) {
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

    const hashedPassword = await hashPassword(password);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      company,
      package: package,
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

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    console.log(users);
    if (!users) {
      return res
        .status(200)
        .json({ success: true, message: "No Users Available" });
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
    const userId= req.params.id;
    const data = req.body;
    console.log('userId' , userId)

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

module.exports = { createUser, getAllUsers, updateUser };
