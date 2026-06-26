const orderModel = require("../../models/orderModel");
const variantModel = require("../../models/variantModel");
const ProductModel = require("../../models/productModel");
const transactionModel = require("../../models/transactionModel");
const couponModel = require("../../models/couponModel");
const mongoose = require("mongoose");
const cartModel = require("../../models/cartModel");
const policyModel = require("../../models/policyModel");
const salesReturnModel = require("../../models/salesReturnModel");
const Customer = require("../../models/customerModel");
const newOrderEmail = require("../../templates/newOrder");
const orderCancelEmail = require("../../templates/orderCancelled");
const { sendEmail } = require("../../utils/email");

const generateOrderNumber = () => {
  const timestamp = Date.now(); // 1750673456789
  const random = Math.floor(1000 + Math.random() * 9000);

  return `#ORD-${timestamp}-${random}`;
};

exports.placeOrder = async (req, res) => {
  try {
    const {
      products,
      billingAddress,
      shippingAddress,
      paymentMethod,
      couponCode,
      coupounDiscount,
    } = req.body;

    console.log(req.body, "Body");
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

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: `Customer not found: ${customerId}`,
      });
    }

    //  Fetch product details from DB to calculate accurate pricing
    const populatedProducts = [];
    for (const item of products) {
      let dbProduct;
      let productId;
      let variantId = item.variantId;

      if (variantId) {
        dbProduct = await variantModel
          .findById(variantId)
          .populate("product")
          .lean();

        if (!dbProduct) {
          return res.status(404).json({
            success: false,
            message: `Variant not found: ${variantId}`,
          });
        }
        productId = dbProduct.product._id;
      } else {
        dbProduct = await ProductModel.findById(item.productId).lean();
        if (!dbProduct) {
          return res.status(404).json({
            success: false,
            message: `Product not found: ${item.productId}`,
          });
        }
        productId = dbProduct._id;
      }

      const cartItem = await cartModel.findOne({
        customerId: new mongoose.Types.ObjectId(customerId),
        productId: new mongoose.Types.ObjectId(productId),
        variantId: variantId ? new mongoose.Types.ObjectId(variantId) : null,
        isDeleted: false,
      });
      if (cartItem) {
        cartItem.isDeleted = true;
        await cartItem.save();
      }

      const stockQuantity = variantId ? dbProduct.quantity : dbProduct.stock;
      const productTitle = variantId
        ? dbProduct.product.title
        : dbProduct.title;

      if (item.quantity > stockQuantity) {
        return res.status(400).json({
          success: false,
          message: `Product out of stock: ${productTitle}`,
        });
      }

      const basePrice =
        (variantId ? dbProduct.price : dbProduct.basePrice) || item.price || 0;
      const price =
        (variantId ? dbProduct.discountedPrice : dbProduct.discountedPrice) ||
        item.discountedPrice ||
        basePrice;

      const totalBasePrice = basePrice * item.quantity;
      const total = price * item.quantity;

      const discount = totalBasePrice - total;
      populatedProducts.push({
        productName: dbProduct?.title,
        productId: productId,
        variantId: variantId || null,
        quantity: item.quantity,
        discount,
        totalBasePrice,
        price,
        total,
      });
    }

    const coupon = await couponModel.findOne({
      couponCode: couponCode,
      isActive: true,
      isDeleted: false,
    });

    //  Calculate summary
    const subTotal = populatedProducts.reduce((sum, i) => sum + i.total, 0);
    // const taxAmount = +(subTotal * 0.18).toFixed(2);
    const taxAmount = 0;
    const policy = await policyModel.findOne({
      isActive: true,
      isDeleted: false,
    });
    const shippingCharge =
      subTotal > policy.minFreeShippingAmount ? 0 : policy.shippingCharge;
    const totalAmount = subTotal + taxAmount + shippingCharge;

    const today = new Date();
    const expectedDeliveryDate = new Date(today);
    expectedDeliveryDate.setDate(
      today.getDate() + (policy?.deliveryWithinDays || 7),
    );

    const orderId = generateOrderNumber();
    //  Create order
    const order = await orderModel.create({
      orderId: orderId,
      customer: customerId,
      product: populatedProducts,
      billingAddress,
      shippingAddress,
      paymentMethod,
      orderStatus: "confirmed",
      subTotal,
      taxAmount,
      shippingCharge: shippingCharge,
      totalAmount,
      expectedDeliveryDate,
      coupounDiscount,
      couponCode,
    });

    if (coupon) {
      coupon.usedBy.push({ userId: customerId, orderId: order._id, count: 1 });
      coupon.usedCount += 1;
      await coupon.save();
    }

    //  Create transaction entry (optional if not COD)
    let transaction = null;
    if (paymentMethod !== "cash" || paymentMethod !== "cod") {
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
      if (item.variantId) {
        await variantModel.findByIdAndUpdate(item.variantId, {
          $inc: { quantity: -item.quantity },
        });
      } else {
        await ProductModel.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity },
        });
      }
    }

    const fullShippingAddress = [
      shippingAddress?.addressLine1,
      shippingAddress?.addressLine2,
      shippingAddress?.city,
      shippingAddress?.state,
      shippingAddress?.country,
      shippingAddress?.postalCode,
    ]
      .filter(Boolean) // Removes undefined, null, "", false
      .join(", ");

    const baseUrl = process.env.BASE_URL;

    const html = newOrderEmail({
      logoUrl: `${baseUrl}/logo.png`,
      companyName: "Bixright Software",

      orderNumber: orderId,

      orderDate: new Date().toLocaleDateString(),
      orderTime: new Date().toLocaleTimeString(),

      customerName: customer?.firstName,
      customerEmail: customer?.email,
      customerPhone: customer?.phone,

      totalItems: products,
      subtotal: subTotal,
      shippingCharge: shippingCharge,

      tax: taxAmount,
      totalAmount: totalAmount,

      orderStatus: "confirmed",

      paymentMethod: paymentMethod,
      paymentStatus: paymentMethod === "cod" ? "pending" : "paid",

      shippingAddress: fullShippingAddress,
      orderItems: populatedProducts,
    });

    const email = process.env.SMTP_USER;
    sendEmail(email, [], [], `🛒 New Order Received `, html);

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
        "couponCode discountType discountValue description startDate endDate minOrderAmount maxDiscountAmount usageLimit usageNumberPerUser",
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
      {
        $unwind: {
          path: "$product.variantDetails",
          preserveNullAndEmptyArrays: true,
        },
      },

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
          courierCompany: { $first: "$courierCompany" },
          trackingNumber: { $first: "$trackingNumber" },
          coupounDiscount: { $first: "$coupounDiscount" },
          products: {
            $push: {
              productId: "$product.productId",
              variantId: "$product.variantId",
              quantity: "$product.quantity",
              discount: "$product.discount",
              total: "$product.total",
              totalBasePrice: "$product.totalBasePrice",
              title: "$product.productDetails.title",
              subTitle: "$product.productDetails.subTitle",
              size: "$product.variantDetails.size",
              color: "$product.variantDetails.color",
              image: {
                $ifNull: [
                  "$product.variantDetails.image",
                  {
                    $arrayElemAt: [
                      "$product.productDetails.images.imageUrl",
                      0,
                    ],
                  },
                ],
              },
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
      {
        $unwind: {
          path: "$product.variantDetails",
          preserveNullAndEmptyArrays: true,
        },
      },

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
          couponCode: { $first: "$couponCode" },
          coupounDiscount: { $first: "$coupounDiscount" },
          createdAt: { $first: "$createdAt" },
          product: {
            $push: {
              productId: "$product.productId",
              variantId: "$product.variantId",
              quantity: "$product.quantity",
              discount: "$product.discount",
              totalBasePrice: "$product.totalBasePrice",
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

    console.log("Order ID", req.body);

    // Validation
    if (!orderId || !customerId) {
      return res.status(400).json({
        message: "Both orderId and customerId are required",
      });
    }

    // Find order
    const order = await orderModel.findOne({ _id: orderId });

    console.log(order);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    // Check if the order belongs to this customer
    if (order.customer.toString() !== customerId.toString()) {
      return res.status(403).json({
        message: "Unauthorized — you can only cancel your own orders",
      });
    }

    //  Check current order status
    if (["cancelled", "delivered", "shipped"].includes(order.orderStatus)) {
      return res.status(400).json({
        message: `Order cannot be cancelled as it is already ${order.orderStatus}`,
      });
    }

    const customer = await Customer.findById(order?.customer);

    //  Cancel the order
    order.orderStatus = "cancelled";
    order.remark = remark || "Cancelled by customer";

    await order.save();

    const baseUrl = process.env.BASE_URL;

    const html = orderCancelEmail({
      logoUrl: `${baseUrl}/logo.png`,
      companyName: "Bixright Software",
      orderId: order?.orderId,

      customerName: customer?.firstName,
      customerEmail: customer?.email,
      customerPhone: customer?.phone,

      totalAmount: order?.totalAmount,
      cancelledDate: new Date().toLocaleDateString(),
      cancelledTime: new Date().toLocaleTimeString(),

      remark: remark,
    });

    const email = process.env.SMTP_USER;
    sendEmail(email, [], [], `❌ Order Cancelled `, html);

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

exports.checkCoupons = async (req, res) => {
  try {
    const { code, total } = req.query;
    let id = req.user.id;
    console.log(id, "ppppp");
    id = new mongoose.Types.ObjectId(id);
    console.log(code, total);
    if (!code || !total) {
      return res.status(404).json({
        success: false,
        message: "Coupoun code and total amount is required.",
      });
    }

    const currentDate = new Date();
    let coupon = await couponModel.findOne({
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate },
      minOrderAmount: { $lte: total },
      couponCode: code,
      isActive: true,
      isDeleted: false,
      "usedBy.userId": { $nin: id },
    });
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found!",
      });
    }
    coupon.toObject();
    if (coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        message: "Coupon usage limit exceeded.",
      });
    }

    res.status(200).json({
      success: true,
      message: "coupon fetched successfully.",
      data: coupon,
    });
  } catch (error) {
    console.error("Error fetching coupons:", error);
    res.status(500).json({
      success: false,
      message: "Server error while Checking coupons.",
      error: error.message,
    });
  }
};

exports.createSalesReturn = async (req, res) => {
  try {
    const { order, returnedItems, reason } = req.body;
    const customer = req.user?.id;

    if (!order || !customer || !returnedItems || returnedItems.length === 0) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    //  Verify order existence
    const validOrder = await orderModel.findById(order);
    if (!validOrder) {
      return res.status(404).json({ message: "Order not found." });
    }

    //  Check order ownership
    if (validOrder.customer.toString() !== customer.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized — you can only return your own orders.",
      });
    }

    //  Check order delivery status
    if (validOrder.orderStatus !== "delivered") {
      return res.status(400).json({
        success: false,
        message: "You can only request a return for delivered orders.",
      });
    }

    //  Calculate totalReturn and validate items
    let totalReturn = 0;
    const calculatedItems = [];

    for (const item of returnedItems) {
      const { variantId, quantity } = item;

      const variant = await variantModel.findById(variantId);
      if (!variant) {
        return res
          .status(404)
          .json({ message: `Variant not found: ${variantId}` });
      }

      //  Check if variant was part of the order
      const orderedVariant = validOrder.product.find(
        (i) => i.variantId.toString() === variantId.toString(),
      );
      if (!orderedVariant) {
        return res.status(400).json({
          success: false,
          message: `Variant ${variantId} was not part of this order.`,
        });
      }

      const qty = quantity || 1;

      //  Get total quantity already returned for this variant
      const previousReturns = await salesReturnModel.aggregate([
        { $match: { order: validOrder._id, isDeleted: false } },
        { $unwind: "$returnedItems" },
        {
          $match: {
            "returnedItems.variantId": variant._id,
          },
        },
        {
          $group: {
            _id: "$returnedItems.variantId",
            totalReturnedQty: { $sum: "$returnedItems.quantity" },
          },
        },
      ]);

      const alreadyReturnedQty = previousReturns[0]?.totalReturnedQty || 0;
      const totalToReturn = alreadyReturnedQty + qty;

      //  Validate total quantity doesn’t exceed ordered quantity
      if (totalToReturn > orderedVariant.quantity) {
        const remainingQty =
          orderedVariant.quantity - alreadyReturnedQty <= 0
            ? 0
            : orderedVariant.quantity - alreadyReturnedQty;
        return res.status(400).json({
          success: false,
          message: `You cann't return more of this product.`,
        });
      }

      //  Calculate refund amount
      const amount = variant.discountedPrice * qty;
      totalReturn += amount;

      calculatedItems.push({
        variantId,
        quantity: qty,
        amount,
      });
    }

    //  Create return record
    const newReturn = new salesReturnModel({
      order,
      customer,
      returnedItems: calculatedItems,
      totalReturn,
      reason,
    });

    await newReturn.save();

    res.status(201).json({
      success: true,
      message: "Return request submitted successfully.",
      totalReturn,
      data: newReturn,
    });
  } catch (err) {
    console.error("Error creating sales return:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
