
const Supplier = require("../models/supplierModel");

const getSupplierData = async (req, res) => {
  try {
    const supplier = await Supplier.find();
    if (!supplier) {
      return res
        .status(404)
        .json({ success: false, message: "No Supplier Yet" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Supplier Fetched", supplier });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.message);
  }
};

const getSupplierById = async (req, res) => {
  const id = req.params;
  console.log(id);

  if (!id) {
    return res
      .status(404)
      .json({ success: false, message: "No supplierId provided" });
  }

  try {
    const supplier = await Supplier.findById(id);
    if (!supplier) {
      return res
        .status(404)
        .json({ success: false, message: "No supplier Found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "supplier Fetched", supplier });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.message);
  }
};

const addSupplier = async (req, res) => {
  try {
    const {
      company,
      firstName,
      lastName,
      phone,
      alternatePhone,
      email,
      address,
      gstNumber,
      panNumber,
      bankDetails,
      status,
      remark,
    } = req.body;

    if (!firstName || !phone || !email ) {
      return res.status(400).json({
        success: false,
        message: "Details Missing !",
      });
    }

    const emailExist = await Supplier.findOne({ email });

    if (emailExist) {
      return res.status(400).json({
        success: false,
        message: "Email Already Exist !",
      });
    }

    const phoneExist = await Supplier.findOne({ phone });

    if (phoneExist) {
      return res.status(400).json({
        success: false,
        message: "Phone Number Already Exist !",
      });
    }

    const supplier = new Supplier({
      company,
      firstName,
      lastName,
      phone,
      alternatePhone,
      email,
      address,
      gstNumber,
      panNumber,
      bankDetails,
      status,
      remark,
    });

    await supplier.save();

    return res.status(200).json({
      success: true,
      message: "Supplier Created Successfully !",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateSupplier = async (req, res) => {
  try {
    const supplierId = req.params.id;
    const data = req.body;
    console.log(data);

    if (!supplierId) {
      return res
        .status(400)
        .json({ success: false, message: "supplierId Missing" });
    }

    const supplier = await Supplier.findByIdAndUpdate(supplierId, data, {
      new: true,
    });

    if (!supplier) {
      return res
        .status(404)
        .json({ success: false, message: "Supplier not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Supplier Updated Successfully",
      supplier,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteSupplier = async (req, res) => {
  try {
    const supplierId = req.params.id;

    if (!supplierId) {
      return res
        .status(400)
        .json({ success: false, message: "supplierId Missing" });
    }

    const check = await Supplier.findByIdAndDelete(supplierId);
    if (!check) {
      return res
        .status(404)
        .json({ success: false, message: "Supplier Id Not Found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Supplier Deleted Successfully !" });
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
        .json({ success: false, message: "supplierIds Missing" });
    }

    const result = await Supplier.deleteMany({ _id: { $in: ids } });

    return res.status(200).json({
      success: true,
      message: `${ids.length} Supplier Deleted Successfully !`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getSupplierData,
  getSupplierById,
  addSupplier,
  updateSupplier,
  deleteSupplier,
  bulkDelete,
};
