
const Customer = require("../../models/customerModel");

const getCustomerData = async (req, res) => {
  try {
    const customer = await Customer.find();
    if (!customer) {
      return res
        .status(404)
        .json({ success: false, message: "No Customer Yet" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Customer Fetched", customer });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.message);
  }
};

const getCustomerById = async (req, res) => {
  const id = req.params;
  console.log(id);

  if (!id) {
    return res
      .status(404)
      .json({ success: false, message: "No customerId provided" });
  }

  try {
    const customer = await Customer.findById(id);
    if (!customer) {
      return res
        .status(404)
        .json({ success: false, message: "No customer Found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "customer Fetched", customer });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.message);
  }
};

const addCustomer = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      dob,
      gender,
      phone,
      alternatePhone,
      email,
      address,
      bankDetails,
      remark,
    } = req.body;

    if (!firstName || !dob || !phone || !email  ) {
      return res.status(400).json({
        success: false,
        message: "Details Missing !",
      });
    }

    const emailExist = await Customer.findOne({ email });

    if (emailExist) {
      return res.status(400).json({
        success: false,
        message: "Email Already Exist !",
      });
    }

    const phoneExist = await Customer.findOne({ phone });

    if (phoneExist) {
      return res.status(400).json({
        success: false,
        message: "Phone Number Already Exist !",
      });
    }

    const customer = new Customer({
      firstName,
      lastName,
      dob,
      gender,
      phone,
      alternatePhone,
      email,
      address,
      bankDetails,
      remark,
    });

    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Customer Created Successfully !",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateCustomer = async (req, res) => {
  try {
    const customerId = req.params.id;
    const data = req.body;
    console.log(data);

    if (!customerId) {
      return res
        .status(400)
        .json({ success: false, message: "customerId Missing" });
    }

    const customer = await Customer.findByIdAndUpdate(customerId, data, {
      new: true,
    });

    if (!customer) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Customer Updated Successfully",
      customer,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteCustomer = async (req, res) => {
  try {
    const customerId = req.params.id;

    if (!customerId) {
      return res
        .status(400)
        .json({ success: false, message: "customerId Missing" });
    }

    const check = await Customer.findByIdAndDelete(customerId);
    if (!check) {
      return res
        .status(404)
        .json({ success: false, message: "Customer Id Not Found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Customer Deleted Successfully !" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const bulkDelete = async (req, res) => {
  const { ids } = req.body;
  try {
    if (!ids || !ids.length) {
      return res
        .status(400)
        .json({ success: false, message: "customerIds Missing" });
    }

    const result = await Customer.updateMany(
      { _id: { $in: ids } },
      { 
        $set: { 
          isDeleted: true,
          deletedAt: new Date()
        } 
      }
    );

    return res.status(200).json({
      success: true,
      message: `${ids.length} Customer Deleted Successfully !`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Soft Delete
const softDeleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      {
        isDeleted: true,
        deletedAt: new Date(),
      },
      { new: true }
    );

    if (!customer) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    }

    res.json({
      success: true,
      message: "Customer Deleted",
      customer,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCustomerData,
  getCustomerById,
  addCustomer,
  updateCustomer,
  deleteCustomer,
  bulkDelete,
  softDeleteCustomer
};
