const Category = require("../../models/categoryModel");

const getCategoryData = async (req, res) => {
  try {
    // Check if pagination is requested (presence of page or limit)
    // If not, return all data in legacy format for dropdowns/backward compatibility
    if (!req.query.page && !req.query.limit) {
      const category = await Category.find({ isDeleted: false }).sort({ createdAt: -1 });
      return res.status(200).json({
        success: true,
        message: "Category Fetched",
        category,
      });
    }

    let { page = 1, limit = 10, search = "", status } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    const filter = { isDeleted: false };

    if (status) {
      if (status === "true" || status === "active") {
        filter.isActive = true;
      } else if (status === "false" || status === "inactive") {
        filter.isActive = false;
      }
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const category = await Category.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Category.countDocuments(filter);

    return res.status(200).json({
      success: true,
      message: category.length === 0 ? "No category found" : "Category Fetched",
      data: {
        data: category,
        pagination: {
          page: page,
          limit: limit,
          total: total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getcategoryById = async (req, res) => {
  const id = req.params;
  console.log(id);

  try {
    const category = await Category.findById(id);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "No category Found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "category Fetched", category });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.message);
  }
};

const addCategory = async (req, res) => {
  try {

    const data = req.body;
    const file = req.file;

    console.log("data", data);
    console.log("file", file);

    let imageUrl = null;

    const { title, description, status } = req.body;

    // 🟡 Validate input
    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Title is required!",
      });
    }

    // 🟢 Normalize title for duplicate check
    const normalizedTitle = title.trim().toLowerCase();

    const existing = await Category.findOne({
      title: { $regex: new RegExp(`^${normalizedTitle}$`, "i") },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Category already exists!",
      });
    }

    if (file) {
      const baseUrl = process.env.BACKEND_URL;
      let fileUrl = file.path.replace(/\\/g, "/");
      imageUrl = `${baseUrl}/${fileUrl}`;
    }

    // 🟣 Check parent category (if provided)
    // let parentCatData = null;
    // if (parentCategory) {
    //   parentCatData = await Category.findById(parentCategory);
    //   if (!parentCatData) {
    //     return res.status(400).json({
    //       success: false,
    //       message: "Parent category not found!",
    //     });
    //   }
    // }

    // 🔵 Create category (slug auto-generated in model)
    const category = new Category({
      image: imageUrl,
      title,
      description,
      // parentCategory: parentCatData
      //   ? {
      //       id: parentCatData._id || null ,
      //       name: parentCatData.title || null,
      //     }
      //   : {},
    });

    await category.save();

    return res.status(201).json({
      success: true,
      message: "Category created successfully!",
      data: category,
    });
  } catch (error) {
    console.error("Error adding category:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;

    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: "CategoryId Missing",
      });
    }

    const { title, description, isActive, oldImage } = req.body;
    const file = req.file;

    let imageUrl = oldImage; // default existing image

    // If new image uploaded
    if (file) {
      const baseUrl = process.env.BACKEND_URL;
      let fileUrl = file.path.replace(/\\/g, "/");
      imageUrl = `${baseUrl}/${fileUrl}`;
    }

    // Build update object ONLY with fields that exist
    const updateData = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (imageUrl !== undefined) updateData.image = imageUrl;

    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      updateData,
      { new: true }
    );

    if (!updatedCategory) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Category Updated Successfully",
      category: updatedCategory,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;

    if (!categoryId) {
      return res
        .status(400)
        .json({ success: false, message: "CategoryId Missing" });
    }

    const check = await Category.findByIdAndDelete(categoryId);
    if (!check) {
      return res
        .status(404)
        .json({ success: false, message: "Category Id Not Found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Category Deleted Successfully !" });
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
        .json({ success: false, message: "CategoryIds Missing" });
    }

    const result = await Category.updateMany(
      { _id: { $in: ids } },
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date()
        }
      }
    );

    return res.status(200).json({
      success: true,
      message: `${ids.length} Category Deleted Successfully !`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Soft Delete Category
const softDeleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      {
        isDeleted: true,
        deletedAt: new Date(),
      },
      { new: true }
    );

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    res.json({
      success: true,
      message: "Category Deleted",
      category,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCategoryData,
  getcategoryById,
  addCategory,
  updateCategory,
  deleteCategory,
  bulkDelete,
  softDeleteCategory
};
