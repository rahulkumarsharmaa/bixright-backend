const Stock = require("../../models/stockModel");
const Product = require("../../models/productModel");

const getStockData = async (req, res) => {
  try {
    const stock = await Stock.find().populate("product", "title imageUrl");
    console.log(stock)
    if (!stock) {
      return res
        .status(404)
        .json({ success: false, message: "No stock Found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "stock Fetched", stock });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.message);
  }
};

const getStockById = async (req, res) => {
  const id = req.params;
  console.log(id);

  try {
    const stock = await Stock.findById(id);
    if (!stock) {
      return res
        .status(404)
        .json({ success: false, message: "No stock Found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "stock Fetched", stock });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.message);
  }
};

const addStock = async (req, res) => {
  try {
    
    const { product, quantity, reason, note, status } = req.body;

    if (!product || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Details Missing !",
      });
    }

    const productExist = await Product.findById(product);
    if (!productExist) {
      return res.status(400).json({
        success: false,
        message: "No Product Available !",
      });
    }

    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be Positive!",
      });
    }

    const stock = new Stock({
      product,
      quantity,
      reason,
      note,
      status,
    });

    await stock.save();

    return res.status(200).json({
      success: true,
      message: "Stock Created Successfully !",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateStock = async (req, res) => {
  try {
    const stockId = req.params.id;
    const data = req.body;
    console.log(data);

    if (!stockId) {
      return res
        .status(400)
        .json({ success: false, message: "stockId Missing" });
    }

    const stock = await Stock.findByIdAndUpdate(stockId, data, {
      new: true,
    });

    if (!stock) {
      return res
        .status(404)
        .json({ success: false, message: "stock not found" });
    }

    return res.status(200).json({
      success: true,
      message: "stock Updated Successfully",
      stock,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteStock = async (req, res) => {
  try {
    const stockId = req.params.id;

    if (!stockId) {
      return res
        .status(400)
        .json({ success: false, message: "stockId Missing" });
    }

    const check = await Stock.findByIdAndDelete(stockId);
    if (!check) {
      return res
        .status(404)
        .json({ success: false, message: "stock Id Not Found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "stock Deleted Successfully !" });
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
        .json({ success: false, message: "stockIds Missing" });
    }

    const result = await Stock.deleteMany({ _id: { $in: ids } });

    return res.status(200).json({
      success: true,
      message: `${ids.length} stock Deleted Successfully !`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getStockData,
  getStockById,
  addStock,
  updateStock,
  deleteStock,
  bulkDelete,
};
