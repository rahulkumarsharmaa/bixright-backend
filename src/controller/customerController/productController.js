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
      sizeId,
      colorId,
      minPrice,
      maxPrice,
      tagId,
    } = req.query;

    page = Number(page);
    limit = Number(limit);

    // Base filter

    const filter = {
      isActive: true,
      isDeleted: false,
    };

    // Filter by categoryId
    if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) {
      filter["category.id"] = categoryId;
    }

    // Filter by subCategoryId
    if (subCategoryId && mongoose.Types.ObjectId.isValid(subCategoryId)) {
      filter["subCategory.id"] = subCategoryId;
    }

    if (tagId) {
      filter["tags.id"] = tagId;
    }
    // Filter by brandId
    if (brandId) {
      const brandIds = brandId
        .split(",")
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id));

      if (brandIds.length > 0) {
        filter["brand.id"] = { $in: brandIds };
      }
    }

    if (sizeId) {
      const sizeIds = sizeId
        .split(",")
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id));

      if (sizeIds.length > 0) {
        filter["size.id"] = { $in: sizeIds };
      }
    }

    if (colorId) {
      const colorIds = colorId
        .split(",")
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id));

      if (colorIds.length > 0) {
        filter["color.id"] = { $in: colorIds };
      }
    }

    if (minPrice || maxPrice) {
      filter.basePrice = {};
      if (minPrice) filter.basePrice.$gte = Number(minPrice);
      if (maxPrice) filter.basePrice.$lte = Number(maxPrice);
    }

    let products = [];
    let total = 0;

    if (page === -1) {
      // Fetch all
      products = await ProductModel.find(filter)
        .sort({ createdAt: -1 })
        .select(
          "title subTitle description price discount category.id category.name subCategory.id subCategory.name size.id size.name brand.id brand.name quantity images isActive isVisible createdAt updatedAt"
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
            "title subTitle description category.id category.name subCategory.id subCategory.name size brand.id brand.name quantity images isActive basePrice"
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
    const product = await ProductModel.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    //  Fetch variants linked to this product
    const variants = await VariantModel.find({
      product: id,
      isDeleted: false,
    }).select("_id sku size color price quantity image status");

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
      images: product.images || [],
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

exports.fetchfilter = async (req, res) => {
  try {
    let { categoryId, subCategoryId } = req.query;

    const filter = {
      isActive: true,
      isDeleted: false,
    };

    // Filter by categoryId
    if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) {
      filter["category.id"] = categoryId;
    }

    // Filter by subCategoryId
    if (subCategoryId && mongoose.Types.ObjectId.isValid(subCategoryId)) {
      filter["subCategory.id"] = subCategoryId;
    }

    // Fetch all products
    const products = await ProductModel.find(filter)
      .populate("size.id", "title") // Populate nested id
      .populate("color.id", "title");
    // .populate("brand.id", "title");

    // --- Extract unique sizes ---
    const sizeMap = new Map();
    products.forEach((product) => {
      product.size.forEach((s) => {
        if (s.id?._id) {
          sizeMap.set(s.id._id.toString(), {
            id: s.id._id,
            name: s.id.title,
          });
        }
      });
    });

    // --- Extract unique colors ---
    const colorMap = new Map();
    products.forEach((product) => {
      product.color.forEach((c) => {
        if (c.id?._id) {
          colorMap.set(c.id._id.toString(), {
            id: c.id._id,
            name: c.id.title,
          });
        }
      });
    });

    // --- Extract unique brands ---
    const brandMap = new Map();
    products.forEach((product) => {
      // Case 1: brand is populated (brand.id is an object with _id and name)
      // if (product.brand?.id?._id) {
      //   brandMap.set(product.brand.id._id.toString(), {
      //     id: product.brand.id._id,
      //     title: product.brand.id.title,
      //   });
      // }

      // Case 2: brand is stored directly as { id, name } (not populated)
      if (product.brand?.id && product.brand?.name) {
        brandMap.set(product.brand.id.toString(), {
          id: product.brand.id,
          name: product.brand.name,
        });
      }
    });

    // --- Calculate min and max price ---
    const prices = products.map((p) => p.basePrice);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    // --- Final Response ---
    const result = {
      size: Array.from(sizeMap.values()),
      color: Array.from(colorMap.values()),
      brand: Array.from(brandMap.values()),
      price: { min: minPrice, max: maxPrice },
    };

    return res.status(200).json({
      success: true,
      message: "Filter data fetched successfully",
      data: result,
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

exports.getRecentlyAddedProducts = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      brandId,
      sizeId,
      colorId,
      minPrice,
      maxPrice,
    } = req.query;
    page = Number(page);
    limit = Number(limit);
    let filter = { isDeleted: false, isActive: true };

    // Filter by brandId
    if (brandId) {
      const brandIds = brandId
        .split(",")
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id));

      if (brandIds.length > 0) {
        filter["brand.id"] = { $in: brandIds };
      }
    }

    if (sizeId) {
      const sizeIds = sizeId
        .split(",")
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id));

      if (sizeIds.length > 0) {
        filter["size.id"] = { $in: sizeIds };
      }
    }

    if (colorId) {
      const colorIds = colorId
        .split(",")
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id));

      if (colorIds.length > 0) {
        filter["color.id"] = { $in: colorIds };
      }
    }

    if (minPrice || maxPrice) {
      filter.basePrice = {};
      if (minPrice) filter.basePrice.$gte = Number(minPrice);
      if (maxPrice) filter.basePrice.$lte = Number(maxPrice);
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Fetch products sorted by createdAt (descending)
    const products = await ProductModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination metadata
    const totalCount = await ProductModel.countDocuments(filter);

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
      message: "Recently added products fetched successfully",
      data: formattedProducts,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching recently added products:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching products",
      error: error.message,
    });
  }
};
