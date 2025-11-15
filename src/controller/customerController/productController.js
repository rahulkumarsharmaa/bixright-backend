const ProductModel=require("../../models/productModel")
const mongoose=require('mongoose')

exports.getActiveProducts = async (req, res) => {
  try {
    let { page = 1, limit = 10, categoryId, subCategoryId } = req.query;

    page = Number(page);
    limit = Number(limit);

    // Base filter
    const filter = { status: "active" };

    // Filter by categoryId
    if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) {
      filter["category.id"] = categoryId;
    }

    // Filter by subCategoryId
    if (subCategoryId && mongoose.Types.ObjectId.isValid(subCategoryId)) {
      filter["subCategory.id"] = subCategoryId;
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
            "title subTitle description price discount category.id category.name subCategory.id subCategory.name size.id size.name brand.id brand.name quantity images status isVisible createdAt updatedAt"
          ),
        ProductModel.countDocuments(filter),
      ]);
    }

    //  Flatten structure for frontend
    const formattedProducts = products.map((item) => ({
      _id: item._id,
      title: item.title,
      subTitle: item.subTitle,
      description: item.description,
      price: item.price,
      discount: item.discount,
      categoryId: item.category?.id || null,
      categoryName: item.category?.name || null,
      subCategoryId: item.subCategory?.id || null,
      subCategoryName: item.subCategory?.name || null,
      sizeId: item.size?.id || null,
      sizeName: item.size?.name || null,
      brandId: item.brand?.id || null,
      brandName: item.brand?.name || null,
      quantity: item.quantity,
      images: item.images,
    }));

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