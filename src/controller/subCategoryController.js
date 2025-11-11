const Category = require("../models/categoryModel");
const SubCategory = require("../models/subcategoryModel");

const getSubCategoryData = async (req, res) => {
  try {
    const subCategory = await SubCategory.find();
    if (!subCategory) {
      return res
        .status(404)
        .json({ success: false, message: "No subCategory Found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "SubCategory Fetched", subCategory });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.message);
  }
};

const getsubCategoryById = async (req, res) => {
  const id = req.params;
  console.log(id);

  try {
    const subCategory = await SubCategory.findById(id);
    if (!subCategory) {
      return res
        .status(404)
        .json({ success: false, message: "No subCategory Found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "subCategory Fetched", subCategory });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.message);
  }
};

const addSubCategory = async (req, res) => {
  try {
    const { title, parentCategory, status } = req.body;

    // 🟡 Validate input
    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Title is required!",
      });
    }

    if (!parentCategory) {
      return res.status(400).json({
        success: false,
        message: "Parent Category is required!",
      });
    }

    const parentCategoryExist = await Category.findById(parentCategory);

    if (!parentCategoryExist) {
      return res.status(400).json({
        success: false,
        message: "Parent Category Not Found!",
      });
    }

    // 🟢 Normalize title for duplicate check
    const normalizedTitle = title.trim().toLowerCase();

    const existing = await SubCategory.findOne({
      title: { $regex: new RegExp(`^${normalizedTitle}$`, "i") },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Sub Category already exists!",
      });
    }

    const subCategory = new SubCategory({
      title,
      parentCategory : {
        id : parentCategoryExist?._id,
        name : parentCategoryExist?.title
      },
      status,
    });

    await subCategory.save();

    return res.status(201).json({
      success: true,
      message: "SubCategory created successfully!",
      data: subCategory,
    });
  } catch (error) {
    console.error("Error adding subCategory:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateSubCategory = async (req, res) => {
  try {
    const subCategoryId = req.params.id;
    const data = req.body;
    console.log(data);

    if (!subCategoryId) {
      return res
        .status(400)
        .json({ success: false, message: "SubCategoryId Missing" });
    }

    const subCategory = await SubCategory.findByIdAndUpdate(
      subCategoryId,
      data,
      {
        new: true,
      }
    );

    if (!subCategory) {
      return res
        .status(404)
        .json({ success: false, message: "SubCategory not found" });
    }

    return res.status(200).json({
      success: true,
      message: "SubCategory Updated Successfully",
      subCategory,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteSubCategory = async (req, res) => {
  try {
    const subCategoryId = req.params.id;

    if (!subCategoryId) {
      return res
        .status(400)
        .json({ success: false, message: "SubCategoryId Missing" });
    }

    const check = await SubCategory.findByIdAndDelete(subCategoryId);
    if (!check) {
      return res
        .status(404)
        .json({ success: false, message: "SubCategory Id Not Found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "SubCategory Deleted Successfully !" });
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
        .json({ success: false, message: "SubCategoryIds Missing" });
    }

    const result = await SubCategory.deleteMany({ _id: { $in: ids } });

    return res.status(200).json({
      success: true,
      message: `${ids.length} SubCategory Deleted Successfully !`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getSubCategoryData,
  getsubCategoryById,
  addSubCategory,
  updateSubCategory,
  deleteSubCategory,
  bulkDelete,
};
