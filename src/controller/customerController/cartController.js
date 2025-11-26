const cartModel = require("../../models/cartModel");
const mongoose = require("mongoose");

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const customerId = req.user.id;
    const { productId, variantId, quantity = 1 } = req.body;

    // Validate input
    if (!customerId || !productId || !variantId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if same product/variant already exists for this customer
    const existingItem = await cartModel.findOne({
      customerId,
      productId,
      variantId,
      isDeleted: false,
    });

    if (existingItem) {
      // If exists, update quantity
      existingItem.quantity += quantity;
      await existingItem.save();
      return res.status(200).json({
        message: "Cart item quantity updated",
        data: existingItem,
      });
    }

    // Otherwise, create new cart item
    const newCartItem = await cartModel.create({
      customerId,
      productId,
      variantId,
      quantity,
    });

    return res.status(201).json({
      message: "Item added to cart successfully",
      data: newCartItem,
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    return res.status(500).json({
      message: "Server error while adding to cart",
      error: error.message,
    });
  }
};

exports.getCartByCustomer = async (req, res) => {
  try {
    const customerId = req.user.id;

    if (!customerId || !mongoose.Types.ObjectId.isValid(customerId)) {
      return res
        .status(400)
        .json({ message: "Valid customerId is required", success: false });
    }

    const cartItems = await cartModel.aggregate([
      {
        $match: {
          customerId: new mongoose.Types.ObjectId(customerId),
          isDeleted: false,
        },
      },
      // Lookup Product details
      {
        $lookup: {
          from: "products", // collection name in MongoDB
          localField: "productId",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      // Lookup Variant details
      {
        $lookup: {
          from: "variants", // collection name in MongoDB
          localField: "variantId",
          foreignField: "_id",
          as: "variant",
        },
      },
      { $unwind: "$variant" },
      // Project the final structure you want in response
      {
        $project: {
          _id: 1,
          customerId: 1,
          quantity: 1,
          createdAt: 1,
          productId: "$product._id",
          title: "$product.title",
          price: "$variant.price",
          images: "$product.images",
          brandName: "$product.brand.name",
          subTitle: "$product.subTitle",
          stockCount: "$variant.quantity",
          variantId: "$variant._id",
          color: "$variant.color",
          size: "$variant.size",
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    if (!cartItems || cartItems.length === 0) {
      return res
        .status(404)
        .json({ message: "No items found in cart", data: [], success: false });
    }

    totalAmount = cartItems.reduce(
      (acc, val) => val.price * val.quantity + acc,
      0
    );

    res.status(200).json({
      success: true,
      message: "Cart items fetched successfully",
      totalAmount,
      count: cartItems.length,
      data: cartItems,
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching cart items",
      error: error.message,
    });
  }
};

exports.updateCart = async (req, res) => {
  try {
    const customerId = req.user.id;

    const { productId, variantId, action } = req.body;

    if (!customerId || !productId || !variantId || !action) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate action
    if (!["increase", "decrease", "delete"].includes(action)) {
      return res.status(400).json({
        message: "Action must be 'increase' or 'decrease'or 'delete'",
      });
    }

    // Find the cart item
    const cartItem = await cartModel.findOne({
      customerId,
      productId,
      variantId,
      isDeleted: false,
    });

    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    // Update quantity based on action
    if (action === "increase") {
      cartItem.quantity += 1;
    } else if (action === "decrease") {
      if (cartItem.quantity > 1) {
        cartItem.quantity -= 1;
      } else {
        return res
          .status(400)
          .json({ message: "Quantity cannot be less than 1" });
      }
    } else if (action === "delete") {
      cartItem.isDeleted = true;
    }

    // Save the updated cart item
    await cartItem.save();

    return res.status(200).json({
      message: "Cart quantity updated successfully",
      data: cartItem,
    });
  } catch (error) {
    console.error("Error updating cart quantity:", error);
    return res.status(500).json({
      message: "Server error while updating cart quantity",
      error: error.message,
    });
  }
};
