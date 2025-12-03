const orderModel = require("../../models/orderModel");
const variantModel = require("../../models/variantModel");
const transactionModel = require("../../models/transactionModel");
const couponModel = require("../../models/couponModel");
const mongoose = require("mongoose");
const cartModel = require("../../models/cartModel");
const policyModel = require("../../models/policyModel");

exports.placeOrder = async (req, res) => {
  try {
    const { products, billingAddress, shippingAddress, paymentMethod } =
      req.body;
    const customerId = req.user?.id;

    if (!products || products.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No products provided" });
    }

    if (!billingAddress || !shippingAddress) {
      return res
        .status(400)
        .json({ success: false, message: "Address not provided" });
    }

    if (!paymentMethod) {
      return res
        .status(400)
        .json({ success: false, message: "paymentMethod not provided" });
    }

    //  Fetch product details from DB to calculate accurate pricing
    const populatedProducts = [];
    for (const item of products) {
      const dbProduct = await variantModel
        .findById(item.variantId)
        .populate("product", "title")
        .lean();

      const cartItem = await cartModel.findOne({
        customerId: new mongoose.Types.ObjectId(customerId),
        productId: new mongoose.Types.ObjectId(dbProduct.product._id),
        variantId: new mongoose.Types.ObjectId(item.variantId),
        isDeleted: false,
      });
      if (cartItem) {
        cartItem.isDeleted = true;
        await cartItem.save();
      }

      if (!dbProduct) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.productId}`,
        });
      }

      if (item.quantity > dbProduct.quantity) {
        return res.status(404).json({
          success: false,
          message: `Product out of stock: ${dbProduct.product.title}`,
        });
      }

      // You can fetch variant price from dbProduct.variants if needed
      const price = dbProduct.price || item.price || 0;

      populatedProducts.push({
        productId: dbProduct.product._id,
        variantId: item.variantId,
        quantity: item.quantity,
        discount: item.discount || 0,
        price,
        total: price * item.quantity - (item.discount || 0),
      });
    }

    //  Calculate summary
    const subTotal = populatedProducts.reduce((sum, i) => sum + i.total, 0);
    const taxAmount = +(subTotal * 0.18).toFixed(2);
    const shippingCharge = 0;
    const totalAmount = subTotal + taxAmount + shippingCharge;

    const daysToAdd = await policyModel.findOne(
      { isActive: true, isDeleted: false },
      { deliveryWithinDays: 1 }
    );
    const today = new Date();
    const expectedDeliveryDate = new Date(today);
    expectedDeliveryDate.setDate(
      today.getDate() + (daysToAdd?.deliveryWithinDays || 7)
    );
    //  Create order
    const order = await orderModel.create({
      customer: customerId,
      product: populatedProducts,
      billingAddress,
      shippingAddress,
      paymentMethod,
      orderStatus: "confirmed",
      subTotal,
      taxAmount,
      shippingCharge,
      totalAmount,
      expectedDeliveryDate,
    });

    //  Create transaction entry (optional if not COD)
    let transaction = null;
    if (paymentMethod !== "cash") {
      transaction = await transactionModel.create({
        orderId: order._id,
        customerId: customerId,
        transactionAmount: totalAmount,
        transactionStatus: "pending",
        paymentGateway: paymentMethod,
      });

      order.transactionId = transaction._id;
      await order.save();
    }

    //  Update inventory (decrement stock)
    for (const item of populatedProducts) {
      await variantModel.findByIdAndUpdate(item.variantId, {
        $inc: { quantity: -item.quantity },
      });
    }

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
      transaction,
    });
  } catch (err) {
    console.error("Error placing order:", err);
    res.status(500).json({
      success: false,
      message: "Failed to place order",
      error: err.message,
    });
  }
};
exports.getAvailableCoupons = async (req, res) => {
  try {
    const currentDate = new Date();

    const coupons = await couponModel
      .find({
        isActive: true,
        isDeleted: false,
        startDate: { $lte: currentDate },
        endDate: { $gte: currentDate },
      })
      .select(
        "couponCode discountType discountValue description startDate endDate minOrderAmount maxDiscountAmount usageLimit usageNumberPerUser"
      )
      .sort({ createdAt: -1 });

    if (!coupons.length) {
      return res.status(200).json({
        success: true,
        message: "No active coupons available at the moment.",
        data: [],
      });
    }

    res.status(200).json({
      success: true,
      message: "Coupons fetched successfully.",
      data: coupons,
    });
  } catch (error) {
    console.error("Error fetching coupons:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching coupons.",
      error: error.message,
    });
  }
};

exports.fetchOrders = async (req, res) => {
  try {
    const customerId = req.user.id;

    const { status } = req.query;

    // Validate Customer ID
    if (!customerId || !mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({
        success: false,
        message: "Valid customerId is required",
      });
    }

    const matchStage = {
      customer: new mongoose.Types.ObjectId(customerId),
      isDeleted: false,
    };

    if (status) {
      matchStage.orderStatus = status;
    }
    const pipeline = [
      { $match: matchStage },

      //  Unwind products array to lookup each product/variant
      { $unwind: "$product" },

      // Join Product info
      {
        $lookup: {
          from: "products",
          localField: "product.productId",
          foreignField: "_id",
          as: "product.productDetails",
        },
      },
      { $unwind: "$product.productDetails" },

      //  Join Variant info
      {
        $lookup: {
          from: "variants",
          localField: "product.variantId",
          foreignField: "_id",
          as: "product.variantDetails",
        },
      },
      { $unwind: "$product.variantDetails" },

      //  Re-group products back to array
      {
        $group: {
          _id: "$_id",
          orderId: { $first: "$orderId" },
          customer: { $first: "$customer" },
          paymentMethod: { $first: "$paymentMethod" },
          paymentStatus: { $first: "$paymentStatus" },
          orderStatus: { $first: "$orderStatus" },
          subTotal: { $first: "$subTotal" },
          taxAmount: { $first: "$taxAmount" },
          shippingCharge: { $first: "$shippingCharge" },
          totalAmount: { $first: "$totalAmount" },
          remark: { $first: "$remark" },
          createdAt: { $first: "$createdAt" },
          expectedDeliveryDate: { $first: "$expectedDeliveryDate" },
          deliveryDate: { $first: "$deliveryDate" },
          products: {
            $push: {
              productId: "$product.productId",
              variantId: "$product.variantId",
              quantity: "$product.quantity",
              discount: "$product.discount",
              total: "$product.total",
              title: "$product.productDetails.title",
              subTitle: "$product.productDetails.subTitle",
              size: "$product.variantDetails.size",
              color: "$product.variantDetails.color",
              image: "$product.variantDetails.image",
            },
          },
        },
      },
      {
        $addFields: {
          startDeliveryDate: {
            $dateSubtract: {
              startDate: "$expectedDeliveryDate",
              unit: "day",
              amount: 2,
            },
          },
          endDeliveryDate: {
            $dateAdd: {
              startDate: "$expectedDeliveryDate",
              unit: "day",
              amount: 2,
            },
          },
        },
      },

      //  Sort by newest first
      { $sort: { createdAt: -1 } },
    ];

    const orders = await orderModel.aggregate(pipeline);

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "No orders found",
      });
    }

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({
      success: false,
      message: "Server error while fetching orders",
      error: err.message,
    });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    // --- Match stage for aggregation ---
    const matchStage = {
      _id: new mongoose.Types.ObjectId(orderId),
      isDeleted: false,
    };

    // --- Aggregation Pipeline ---
    const pipeline = [
      { $match: matchStage },

      //  Join customer info
      {
        $lookup: {
          from: "customers",
          localField: "customer",
          foreignField: "_id",
          as: "customer",
        },
      },
      { $unwind: "$customer" },

      //  Unwind products
      { $unwind: "$product" },

      // Lookup product details
      {
        $lookup: {
          from: "products",
          localField: "product.productId",
          foreignField: "_id",
          as: "product.productDetails",
        },
      },
      { $unwind: "$product.productDetails" },

      //  Lookup variant details
      {
        $lookup: {
          from: "variants",
          localField: "product.variantId",
          foreignField: "_id",
          as: "product.variantDetails",
        },
      },
      { $unwind: "$product.variantDetails" },

      //  Group back to order level
      {
        $group: {
          _id: "$_id",
          orderId: { $first: "$orderId" },
          customer: { $first: "$customer" },
          billingAddress: { $first: "$billingAddress" },
          shippingAddress: { $first: "$shippingAddress" },
          paymentMethod: { $first: "$paymentMethod" },
          paymentStatus: { $first: "$paymentStatus" },
          orderStatus: { $first: "$orderStatus" },
          subTotal: { $first: "$subTotal" },
          taxAmount: { $first: "$taxAmount" },
          shippingCharge: { $first: "$shippingCharge" },
          totalAmount: { $first: "$totalAmount" },
          remark: { $first: "$remark" },
          product: {
            $push: {
              productId: "$product.productId",
              variantId: "$product.variantId",
              quantity: "$product.quantity",
              discount: "$product.discount",
              total: "$product.total",
              productDetails: "$product.productDetails",
              variantDetails: "$product.variantDetails",
            },
          },
        },
      },

      //  Optional: reshape or limit fields
      // {
      //   $project: {
      //     _id: 1,
      //     orderId: 1,
      //     orderStatus: 1,
      //     paymentMethod: 1,
      //     paymentStatus: 1,
      //     subTotal: 1,
      //     taxAmount: 1,
      //     shippingCharge: 1,
      //     totalAmount: 1,
      //     remark: 1,
      //     createdAt: 1,
      //     "customer.firstName": 1,
      //     "customer.lastName": 1,
      //     "customer.phone": 1,
      //     product: 1,
      //     billingAddress: 1,
      //     shippingAddress: 1,
      //   },
      // },
    ];

    const result = await orderModel.aggregate(pipeline);

    if (!result || result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      order: result[0],
    });
  } catch (err) {
    console.error("Error fetching order:", err);
    res.status(500).json({
      success: false,
      message: "Server error while fetching order details",
      error: err.message,
    });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const customerId = req.user.id;
    const { orderId, remark } = req.body;

    // Validation
    if (!orderId || !customerId) {
      return res.status(400).json({
        message: "Both orderId and customerId are required",
      });
    }

    // Find order
    const order = await orderModel
      .findOne({ _id: orderId })
      .populate("customer", "_id");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if the order belongs to this customer
    if (order.customer._id.toString() !== customerId.toString()) {
      return res.status(403).json({
        message: "Unauthorized — you can only cancel your own orders",
      });
    }

    //  Check current order status
    if (["cancelled", "delivered"].includes(order.orderStatus)) {
      return res.status(400).json({
        message: `Order cannot be cancelled as it is already ${order.orderStatus}`,
      });
    }

    //  Cancel the order
    order.orderStatus = "cancelled";
    order.remark = remark || "Cancelled by customer";

    await order.save();

    return res.status(200).json({
      message: "Order cancelled successfully!",
      order: {
        orderId: order.orderId,
        orderStatus: order.orderStatus,
        remark: order.remark,
        deletedAt: order.deletedAt,
      },
    });
  } catch (error) {
    console.error("Error cancelling order:", error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
