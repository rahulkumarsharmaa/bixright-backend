const orderModel = require("../../models/orderModel");
const variantModel = require("../../models/variantModel");
const transactionModel = require("../../models/transactionModel");
const couponModel = require("../../models/couponModel");

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
      console.log(dbProduct);

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

    //  Create order
    const order = await orderModel.create({
      customer: customerId,
      product: populatedProducts,
      billingAddress,
      shippingAddress,
      paymentMethod,
      subTotal,
      taxAmount,
      shippingCharge,
      totalAmount,
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
        status: "active",
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
