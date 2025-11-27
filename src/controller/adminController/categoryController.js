const Category = require("../../models/categoryModel");
const cloudinary = require('../../config/cloudinaryConfig')
const getCategoryData = async (req, res) => {
  try {
    const category = await Category.find();
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "No category Found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Category Fetched", category });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.message);
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
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "variants" },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );

        stream.end(file.buffer); // upload buffer
      });

      imageUrl = uploadResult.secure_url;
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
      image : imageUrl,
      title,
      description,
      status,
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
    const data = req.body;
    console.log(data);

    if (!categoryId) {
      return res
        .status(400)
        .json({ success: false, message: "CategoryId Missing" });
    }

    const category = await Category.findByIdAndUpdate(categoryId, data, {
      new: true,
    });

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Category Updated Successfully",
      category,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
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

    const result = await Category.deleteMany({ _id: { $in: ids } });

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
