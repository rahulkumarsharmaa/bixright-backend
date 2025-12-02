const Stock = require("../../models/stockModel");
const Product = require("../../models/productModel");
const Variant = require("../../models/variantModel");

const getStockData = async (req, res) => {
  try {
    const stock = await Stock.find({ isDeleted: false }).populate(
      "product",
      "title imageUrl"
    );
    console.log(stock);
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
    const stock = await Stock.findById(id).populate('product', 'title').populate('variant', 'sku');
    if (!stock || stock.isDeleted) {
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
    console.log("add", req.body);

    const { product, productVariant, quantity, status } =
      req.body;

    if (!product || !quantity || !productVariant) {
      return res.status(400).json({
        success: false,
        message: "Details Missing !",
      });
    }

    const productExist = await Product.findOne({
      _id: product,
      isDeleted: false,
    });

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

    const variant = await Variant.findOne({
      _id: productVariant,
      isDeleted: false,
    });

    if (!variant) {
      return res.status(404).json({
        success: false,
        message: "Variant Not Found",
      });
    }

    if (status === "in") {
      variant.quantity += Number(quantity);
    } else {
      if (quantity > variant.quantity) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Quantity can not be more than Available stock",
          });
      }
      variant.quantity -= Number(quantity);
    }

    await variant.save();

    const stock = new Stock({
      product,
      productVariant,
      quantity,
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
    console.log("update", data);

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

    console.log('ids', ids)

    const result = await Stock.updateMany(
      { _id: { $in: ids } },
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: `${ids.length} stock Deleted Successfully !`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Soft Delete
const softDeleteStock = async (req, res) => {
  try {
    const stock = await Stock.findByIdAndUpdate(
      req.params.id,
      {
        isDeleted: true,
        deletedAt: new Date(),
      },
      { new: true }
    );

    if (!stock) {
      return res
        .status(404)
        .json({ success: false, message: "stock not found" });
    }

    res.json({
      success: true,
      message: "stock Deleted",
      stock,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getStockData,
  getStockById,
  addStock,
  updateStock,
  deleteStock,
  bulkDelete,
  softDeleteStock,
};
