const Brand = require("../../models/brandModel");
const Product = require("../../models/productModel");
const Order = require("../../models/orderModel");
const Supplier = require("../../models/supplierModel");
const Customer = require("../../models/customerModel");

const getOrderData = async (req, res) => {
  try {
    const order = await Order.find()
      .populate("product.productId", "imageUrl title price")
      .populate("customer", "firstName lastName");
    if (!order) {
      return res.status(404).json({ success: false, message: "No Order Yet" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Order Fetched", order });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.message);
  }
};

const getOrderById = async (req, res) => {
  console.log(req.params);
  const id = req.params;
  console.log(id);

  if (!id) {
    return res
      .status(404)
      .json({ success: false, message: "No orderId provided" });
  }

  try {
    const order = await Order.findById(id)
      .populate("product.productId", "imageUrl title price")
      .populate("customer", "firstName lastName email  address.city phone ");
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "No order Found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "order Fetched", order });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.message);
  }
};

const addOrder = async (req, res) => {
  try {
    const {
      customer,
      product,
      paidAmount,
      permanentAddress,
      shippingAddress,
      paymentMethod,
      transactionId,
      status,
      remark,
    } = req.body;

    console.log(req.body);

    if (!product || product.quantity === 0) {
      return res.status(400).json({
        success: false,
        message: "No Product Selected !",
      });
    }

    const products = product.map((p, index) => ({
      productId: p.productId,
      price: p.price,
      quantity: p.quantity,
      discount: p.discount,
    }));

    for (const i of products) {
      const productExist = await Product.findById(i?.productId);

      if (!productExist) {
        return res.status(400).json({
          success: false,
          message: `Product Not Found ! : ${i.productId}`,
        });
      }
    }

    if (!customer) {
      return res.status(400).json({
        success: false,
        message: "No Customer Selected !",
      });
    }

    const customerExist = await Customer.findById(customer);

    if (!customerExist) {
      return res.status(400).json({
        success: false,
        message: "Customer Not Found !",
      });
    }

    if (product.price <= 0) {
      return res.status(400).json({
        success: false,
        message: "Minimunm Price Can not be Less than 1 !",
      });
    }

    if (product.quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Minimunm Quantity Can not be Less than 1 !",
      });
    }

    if (product.discount > product.price) {
      return res.status(400).json({
        success: false,
        message: "Discount Amount Can't Exceed the Product Price !",
      });
    }

    if (product.discount < 0) {
      return res.status(400).json({
        success: false,
        message: "Discount Amount Can't be less than 0 !",
      });
    }

    const order = new Order({
      customer,
      product: products,
      paidAmount,
      billingAddress: permanentAddress?.country,
      shippingAddress: shippingAddress?.country,
      paymentMethod,
      transactionId,
      status,
      remark,
    });

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order Created Successfully !",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const data = req.body;
    console.log(data);

    if (!orderId) {
      return res
        .status(400)
        .json({ success: false, message: "orderId Missing" });
    }

    const order = await Order.findByIdAndUpdate(orderId, data, {
      new: true,
    });

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Order Updated Successfully",
      order,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const orderId = req.params.id;

    if (!orderId) {
      return res
        .status(400)
        .json({ success: false, message: "orderId Missing" });
    }

    const check = await Order.findByIdAndDelete(orderId);
    if (!check) {
      return res
        .status(404)
        .json({ success: false, message: "Order Id Not Found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Order Deleted Successfully !" });
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
        .json({ success: false, message: "orderIds Missing" });
    }

    const result = await Order.deleteMany({ _id: { $in: ids } });

    return res.status(200).json({
      success: true,
      message: `${ids.length} Order Deleted Successfully !`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Soft Delete
const softDeleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        isDeleted: true,
        deletedAt: new Date(),
      },
      { new: true }
    );

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    res.json({
      success: true,
      message: "Order Deleted",
      order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getOrderData,
  getOrderById,
  addOrder,
  updateOrder,
  deleteOrder,
  bulkDelete,
  softDeleteOrder,
};
