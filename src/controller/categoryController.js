const Category = require("../models/categoryModel");
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
      .json({ success: true, message: "category Fetched", category });
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
    console.log(req.body);
    const { title, description, parentCategory, status } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Details Missing !",
      });
    }

    const lowerTitle = title.toLowerCase();
    const existing = await Category.findOne({ title: lowerTitle });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Category Already Exist !",
      });
    }

    const categoryData = await Category.findById(parentCategory);

    if (!categoryData) {
      return res
        .status(400)
        .json({ success: false, message: "Category not found" });
    }

    const category = new Category({
      title,
      description,
      parentCategory : {
        id : categoryData._id,
        name : categoryData.title
      },
      status,
    });

    await category.save();

    return res.status(200).json({
      success: true,
      message: "Category Created Successfully !",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
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

module.exports = {
  getCategoryData,
  getcategoryById,
  addCategory,
  updateCategory,
  deleteCategory,
  bulkDelete,
};
