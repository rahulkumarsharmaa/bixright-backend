const Category = require("../../models/categoryModel");
const SubCategory = require("../../models/subCategoryModel");


const getSubCategoryData = async (req, res) => {
  try {
    // Check if pagination is requested (presence of page or limit)
    // If not, return all data in legacy format for dropdowns/backward compatibility
    if (!req.query.page && !req.query.limit) {
      const subCategory = await SubCategory.find({ isDeleted: false }).sort({ createdAt: -1 });
      return res.status(200).json({
        success: true,
        message: "SubCategory Fetched",
        subCategory,
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

    const subCategory = await SubCategory.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await SubCategory.countDocuments(filter);

    return res.status(200).json({
      success: true,
      message: subCategory.length === 0 ? "No subCategory Found" : "SubCategory Fetched",
      data: {
        data: subCategory,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
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
    const data = req.body;
    const file = req.file;

    console.log("data", data);
    console.log("file", file);

    let imageUrl = null;
    const { title, parentCategory, description, isActive } = req.body;

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

    if (file) {
      const baseUrl = process.env.BACKEND_URL;
      let fileUrl = file.path.replace(/\\/g, "/");
      imageUrl = `${baseUrl}/${fileUrl}`;
    }

    const subCategory = new SubCategory({
      image: imageUrl,
      title,
      parentCategory: {
        id: parentCategoryExist?._id,
        name: parentCategoryExist?.title,
      },
      description,

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

    if (!subCategoryId) {
      return res.status(400).json({
        success: false,
        message: "CategoryId Missing",
      });
    }

    const { title, description, parentCategory, isActive, oldImage } = req.body;
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

    if (parentCategory !== undefined) {
      // Fetch the category to get its title/name
      const parentCategoryExist = await Category.findById(parentCategory);
      if (!parentCategoryExist) {
        return res.status(400).json({
          success: false,
          message: "Parent Category Not Found!",
        });
      }

      updateData.parentCategory = {
        id: parentCategoryExist._id,
        name: parentCategoryExist.title,
      };
    }

    const updatedSubCategory = await SubCategory.findByIdAndUpdate(
      subCategoryId,
      updateData,
      { new: true }
    );

    if (!updatedSubCategory) {
      return res
        .status(404)
        .json({ success: false, message: "Sub Category not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Sub Category Updated Successfully",
      subCategory: updatedSubCategory,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }

  // try {
  //   const subCategoryId = req.params.id;
  //   const data = req.body;
  //   console.log(data);

  //   if (!subCategoryId) {
  //     return res
  //       .status(400)
  //       .json({ success: false, message: "SubCategoryId Missing" });
  //   }

  //   const subCategory = await SubCategory.findByIdAndUpdate(
  //     subCategoryId,
  //     data,
  //     {
  //       new: true,
  //     }
  //   );

  //   if (!subCategory) {
  //     return res
  //       .status(404)
  //       .json({ success: false, message: "SubCategory not found" });
  //   }

  //   return res.status(200).json({
  //     success: true,
  //     message: "SubCategory Updated Successfully",
  //     subCategory,
  //   });
  // } catch (error) {
  //   console.log(error);
  //   res.status(500).json({ success: false, message: error.message });
  // }
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

    const result = await SubCategory.updateMany(
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
      message: `${ids.length} SubCategory Deleted Successfully !`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Soft Delete
const softDeleteSubCategory = async (req, res) => {
  try {
    const subCategory = await SubCategory.findByIdAndUpdate(
      req.params.id,
      {
        isDeleted: true,
        deletedAt: new Date(),
      },
      { new: true }
    );

    if (!subCategory) {
      return res
        .status(404)
        .json({ success: false, message: "Sub Category not found" });
    }

    res.json({
      success: true,
      message: "Sub Category Deleted",
      subCategory,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getSubCategoryData,
  getsubCategoryById,
  addSubCategory,
  updateSubCategory,
  deleteSubCategory,
  bulkDelete,
  softDeleteSubCategory,
};
