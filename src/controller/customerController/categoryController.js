const categoryModel = require("../../models/categoryModel");
const SubCategory = require("../../models/subCategoryModel");
const Brand = require("../../models/brandModel");
const mongoose = require("mongoose");

exports.getActiveCategories = async (req, res) => {
  try {
    // Get query params
    let { page = 1, limit = 10 } = req.query;

    // Convert to number
    page = Number(page);
    limit = Number(limit);

    // Base filter
    const filter = { isActive: true, isDeleted: false };

    let categories;
    let total;
    const projection = { title: 1, slug: 1, description: 1 };

    if (page === -1) {
      // Return all active categories
      categories = await categoryModel
        .find(filter, projection)
        .sort({ createdAt: -1 });
      total = categories.length;
    } else {
      // Paginated query
      const skip = (page - 1) * limit;
      [categories, total] = await Promise.all([
        categoryModel
          .find(filter, projection)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        categoryModel.countDocuments(filter),
      ]);
    }

    res.status(200).json({
      success: true,
      total,
      page: page === -1 ? null : page,
      totalPages: page === -1 ? 1 : Math.ceil(total / limit),
      data: categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

exports.getActiveSubCategories = async (req, res) => {
  try {
    let { page = 1, limit = 10, categoryId } = req.query;

    page = Number(page);
    limit = Number(limit);

    const filter = { status: { $in: ["active", "Active"] }, isDeleted: false };

    if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) {
      filter["parentCategory.id"] = categoryId;
    }

    let subCategories;
    let total;

    if (page === -1) {
      // Return all active subcategories
      subCategories = await SubCategory.find(filter)
        .sort({ createdAt: -1 })
        .select(
          "title slug description parentCategory.id parentCategory.name image"
        );

      total = subCategories.length;
    } else {
      const skip = (page - 1) * limit;

      [subCategories, total] = await Promise.all([
        SubCategory.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .select(
            "title slug description parentCategory.id parentCategory.name image"
          ),
        SubCategory.countDocuments(filter),
      ]);
    }

    //  Flatten the parentCategory object
    const formattedData = subCategories.map((item) => {
      item = item.toObject();
      return {
        image: item.image || "",
        _id: item._id,
        title: item.title,
        slug: item.slug,
        description: item.description,
        categoryId: item.parentCategory?.id || null,
        categoryName: item.parentCategory?.name || null,
        status: item.status,
      };
    });

    res.status(200).json({
      success: true,
      total,
      page: page === -1 ? null : page,
      totalPages: page === -1 ? 1 : Math.ceil(total / limit),
      data: formattedData,
    });
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// GET all active brands with pagination
exports.getActiveBrands = async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query;

    // Convert to numbers
    page = Number(page);
    limit = Number(limit);

    // Query only active brands
    const filter = { status: { $in: ["active", "Active"] }, isDeleted: false };

    let brands, totalBrands;

    if (page === -1) {
      // Fetch all brands if page = -1
      brands = await Brand.find(filter).sort({ createdAt: -1 });
      totalBrands = brands.length;
    } else {
      // Paginated fetch
      totalBrands = await Brand.countDocuments(filter);
      const skip = (page - 1) * limit;
      brands = await Brand.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    }

    res.status(200).json({
      success: true,
      totalItems: totalBrands,
      totalPages: page === -1 ? 1 : Math.ceil(totalBrands / limit),
      currentPage: page === -1 ? "all" : page,
      data: brands,
    });
  } catch (error) {
    console.error("Error fetching brands:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch active brands",
      error: error.message,
    });
  }
};
