const Brand = require("../../models/brandModel");
const Product = require("../../models/productModel");
const Purchase = require("../../models/purchasemodel");
const Supplier = require("../../models/suppliermodel");

const getPurchaseData = async (req, res) => {
  try {
    const purchase = await Purchase.find().populate('product', 'imageUrl title').populate('supplier', 'company firstName lastName');
    if (!purchase) {
      return res
        .status(404)
        .json({ success: false, message: "No Purchase Yet" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Purchase Fetched", purchase });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.message);
  }
};

const getPurchaseById = async (req, res) => {
  const id = req.params;
  console.log(id);

  if (!id) {
    return res
      .status(404)
      .json({ success: false, message: "No purchaseId provided" });
  }

  try {
    const purchase = await Purchase.findById(id);
    if (!purchase) {
      return res
        .status(404)
        .json({ success: false, message: "No purchase Found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "purchase Fetched", purchase });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.message);
  }
};

const addPurchase = async (req, res) => {
  try {
    const {
      product,
      supplier,
      purchaseDate,
      type,
      price,
      quantity,
      discount,
      paidAmount,
      paymentMethod,
      transactionId,
      status,
      remark,
    } = req.body;

    console.log(req.body)

    if (!product || !purchaseDate || !price || !quantity ) {
      return res.status(400).json({
        success: false,
        message: "Details Missing !",
      });
    }

    const productExist = await Product.findById(product);

    if (!productExist) {
      return res.status(400).json({
        success: false,
        message: "Product Not Found !",
      });
    }

    const supplierExist = await Supplier.findById(supplier);

    if (!supplierExist) {
      return res.status(400).json({
        success: false,
        message: "Supplier Not Found !",
      });
    }

    if (price <= 0) {
      return res.status(400).json({
        success: false,
        message: "Minimunm Price Can not be Less than 1 !",
      });
    }

     if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Minimunm Quantity Can not be Less than 1 !",
      });
    }

    const purchase = new Purchase({
      product,
      supplier,
      purchaseDate,
      type,
      price,
      quantity,
      discount,
      paidAmount,
      paymentMethod,
      transactionId,
      status,
      remark,
    });

    await purchase.save();

    return res.status(200).json({
      success: true,
      message: "Purchase Created Successfully !",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updatePurchase = async (req, res) => {
  try {
    const purchaseId = req.params.id;
    const data = req.body;
    console.log(data);

    if (!purchaseId) {
      return res
        .status(400)
        .json({ success: false, message: "purchaseId Missing" });
    }

    const purchase = await Purchase.findByIdAndUpdate(purchaseId, data, {
      new: true,
    });

    if (!purchase) {
      return res
        .status(404)
        .json({ success: false, message: "Purchase not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Purchase Updated Successfully",
      purchase,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const deletePurchase = async (req, res) => {
  try {
    const purchaseId = req.params.id;

    if (!purchaseId) {
      return res
        .status(400)
        .json({ success: false, message: "purchaseId Missing" });
    }

    const check = await Purchase.findByIdAndDelete(purchaseId);
    if (!check) {
      return res
        .status(404)
        .json({ success: false, message: "Purchase Id Not Found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Purchase Deleted Successfully !" });
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
        .json({ success: false, message: "purchaseIds Missing" });
    }

    const result = await Purchase.deleteMany({ _id: { $in: ids } });

    return res.status(200).json({
      success: true,
      message: `${ids.length} Purchase Deleted Successfully !`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getPurchaseData,
  getPurchaseById,
  addPurchase,
  updatePurchase,
  deletePurchase,
  bulkDelete,
};
