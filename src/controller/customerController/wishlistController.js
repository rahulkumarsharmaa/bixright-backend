const wishlistModel = require("../../models/wishlistModel");
const mongoose = require("mongoose");

exports.addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const customerId = req.user.id;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    // Check if wishlist item already exists
    const existing = await wishlistModel.findOne({
      customerId,
      productId,
    });

    //  Item already exists and is active
    if (existing && !existing.isDeleted) {
      return res.status(400).json({
        success: false,
        message: "This product  is already in wishlist",
      });
    }

    // Item exists but was soft deleted → reactivate it
    if (existing && existing.isDeleted) {
      existing.isDeleted = false;
      await existing.save();

      return res.status(200).json({
        success: true,
        message: "Product re-added to wishlist",
        data: existing,
      });
    }

    //  Item doesn’t exist → create a new one
    const newWishlistItem = await wishlistModel.create({
      customerId,
      productId,
    });

    return res.status(200).json({
      success: true,
      message: "Product added to wishlist",
      data: newWishlistItem,
    });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    res.status(500).json({
      success: false,
      message: "Server error while adding to wishlist",
      error: error.message,
    });
  }
};

exports.getWishlist = async (req, res) => {
  try {
    const customerId = new mongoose.Types.ObjectId(req.user.id);

    // create the aggregation
    const wishlistItems = await wishlistModel.aggregate([
      {
        $match: { customerId, isDeleted: false },
      },
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "productData",
        },
      },
      {
        $unwind: "$productData",
      },
      // {
      //   $lookup: {
      //     from: "variants",
      //     localField: "variantId",
      //     foreignField: "_id",
      //     as: "variantData",
      //   },
      // },
      // {
      //   $unwind: "$variantData",
      // },
      {
        $project: {
          _id: 1,
          productId: "$productData._id",
          title: "$productData.title",
          branndName: "$productData.brand.name",
          subTitle: "$productData.subTitle",
          basePrice: "$productData.basePrice",
          discountedPrice: "$productData.discountedPrice",
          discount: "$productData.discount",
          image: { $arrayElemAt: ["$productData.images.imageUrl", 0] },
          categoryName:"$productData.category.name",
          subCategoryName:"$productData.subCategory.name",
          // variantId: "$variantData._id",
          // image: "$variantData.image",
          // price: "$variantData.price",
          // color: "$variantData.color",
          // size: "$variantData.size",
          // "productData.basePrice": 1,
          // "productData.images": 1,
          // "productData.category": 1,
          // "productData.subCategory": 1,
          // "variantData._id": 1,
          // "variantData.color": 1,
          // "variantData.size": 1,
          // "variantData.stock": 1,
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    return res.status(200).json({
      success: true,
      message: "Wishlist fetched successfully",
      count: wishlistItems.length,
      wishlist: wishlistItems,
    });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching wishlist",
    });
  }
};

exports.deleteWishlistItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const customerId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid wishlist ID" });
    }

    const wishlistItem = await wishlistModel.findOne({
      productId: productId,
      customerId,
      isDeleted: false,
    });

    if (!wishlistItem) {
      return res.status(404).json({
        success: false,
        message: "Wishlist item not found or already deleted",
      });
    }

    wishlistItem.isDeleted = true;
    await wishlistItem.save();

    return res.status(200).json({
      success: true,
      message: "Wishlist item deleted successfully",
      data: wishlistItem,
    });
  } catch (error) {
    console.error("Error in deleting wishlist item:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting wishlist item",
    });
  }
};
