const ProductModel = require("../../models/productModel");
const mongoose = require("mongoose");
const VariantModel = require("../../models/variantModel");

exports.getActiveProducts = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      categoryId,
      subCategoryId,
      brandId,
    } = req.query;

    page = Number(page);
    limit = Number(limit);

    // Base filter
    // const filter = { status: "active" };
    const filter = {};

    // Filter by categoryId
    if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) {
      filter["category.id"] = categoryId;
    }

    // Filter by subCategoryId
    if (subCategoryId && mongoose.Types.ObjectId.isValid(subCategoryId)) {
      filter["subCategory.id"] = subCategoryId;
    }

    // Filter by brandId
    if (brandId && mongoose.Types.ObjectId.isValid(brandId)) {
      filter["brand.id"] = brandId;
    }

    let products = [];
    let total = 0;

    if (page === -1) {
      // Fetch all
      products = await ProductModel.find(filter)
        .sort({ createdAt: -1 })
        .select(
          "title subTitle description price discount category.id category.name subCategory.id subCategory.name size.id size.name brand.id brand.name quantity images status isVisible createdAt updatedAt"
        );
      total = products.length;
    } else {
      const skip = (page - 1) * limit;

      // Paginated
      [products, total] = await Promise.all([
        ProductModel.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .select(
            "title subTitle description category.id category.name subCategory.id subCategory.name size brand.id brand.name quantity images status basePrice"
          ),
        ProductModel.countDocuments(filter),
      ]);
    }

    //  Flatten structure for frontend
    const formattedProducts = products.map((item) => {
      const coverImage = item.images?.find((image) => image.isCover);
      
      return {
        _id: item._id,
        title: item.title,
        subTitle: item.subTitle,
        description: item.description,
        basePrice: item.basePrice,
        categoryId: item.category?.id || null,
        categoryName: item.category?.name || null,
        subCategoryId: item.subCategory?.id || null,
        subCategoryName: item.subCategory?.name || null,
        brandId: item.brand?.id || null,
        brandName: item.brand?.name || null,
        images: [coverImage] || null,
      };
    });

    res.status(200).json({
      success: true,
      total,
      page: page === -1 ? null : page,
      totalPages: page === -1 ? 1 : Math.ceil(total / limit),
      data: formattedProducts,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    //  Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    //  Fetch product
    const product = await ProductModel.findById(id).select(
      "title subTitle description basePrice discount category.id category.name subCategory.id subCategory.name size.id size.name brand.id brand.name images createdAt updatedAt"
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    //  Fetch variants linked to this product
    const variants = await VariantModel.find({ product: id }).select(
      "_id sku size color price quantity image status"
    );

    //  Format response for frontend
    const formattedProduct = {
      _id: product._id,
      title: product.title,
      subTitle: product.subTitle,
      description: product.description,
      basePrice: product.basePrice,
      categoryId: product.category?.id || null,
      categoryName: product.category?.name || null,
      subCategoryId: product.subCategory?.id || null,
      subCategoryName: product.subCategory?.name || null,
      brandId: product.brand?.id || null,
      brandName: product.brand?.name || null,
      variants,
    };

    //  Response
    res.status(200).json({
      success: true,
      data: formattedProduct,
    });
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
