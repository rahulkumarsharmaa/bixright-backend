const Tag = require("../../models/tagModel");


const processLocalImages = (files, req) => {
  // const baseUrl = process.env.BACKEND_URL;
  return files.map((file) => {
    let fileUrl = file.path.replace(/\\/g, "/");
    return `/${fileUrl}`;
  });
};

const getTagData = async (req, res) => {
  try {
    const tags = await Tag.find({ isDeleted: false });

    if (!tags || tags.length === 0) {
      return res.status(200).json({ success: true, message: "No tags found", tags: [] });
    }

    return res.status(200).json({
      success: true,
      message: "Tags fetched successfully",
      tags,
    });
  } catch (error) {
    console.error("Error fetching tags:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getTagById = async (req, res) => {
  const { id } = req.params;

  try {
    const tag = await Tag.findById(id);

    if (!tag || tag.isDeleted) {
      return res.status(404).json({ success: false, message: "Tag not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Tag fetched successfully", tag });
  } catch (error) {
    console.error("Error fetching tag:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const addTag = async (req, res) => {
  try {
    const { title, subTitle, isActive } = req.body;

    if (!title || !subTitle) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Both title and subTitle are required",
        });
    }

    const lowerTitle = title.toLowerCase();

    const existing = await Tag.findOne({ title: lowerTitle, isDeleted: false });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Tag already exists",
      });
    }

    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = processLocalImages(req.files, req);
    }

    const tag = new Tag({
      title: lowerTitle,
      subTitle,
      images: imageUrls,
      isActive: isActive !== undefined ? isActive : true,
    });

    await tag.save();

    return res.status(201).json({
      success: true,
      message: "Tag created successfully",
      tag,
    });
  } catch (error) {
    console.error("Error creating tag:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateTag = async (req, res) => {
  try {
    const tagId = req.params.id;
    const { title, subTitle, isActive } = req.body;

    const tag = await Tag.findById(tagId);
    if (!tag) {
      return res.status(404).json({ success: false, message: "Tag not found" });
    }

    //  Upload new images if provided
    let newImages = tag.images; // keep old ones
    if (req.files && req.files.length > 0) {
      const uploaded = processLocalImages(req.files, req);
      newImages = [...newImages, ...uploaded];
    }

    //  Update fields
    if (title) tag.title = title.toLowerCase();
    if (subTitle) tag.subTitle = subTitle;
    if (isActive !== undefined) tag.isActive = isActive;
    tag.images = newImages;

    await tag.save();

    return res.status(200).json({
      success: true,
      message: "Tag updated successfully",
      tag,
    });
  } catch (error) {
    console.error("Error updating tag:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteTag = async (req, res) => {
  try {
    const tagId = req.params.id;

    if (!tagId) {
      return res.status(400).json({ success: false, message: "tagId Missing" });
    }

    const check = await Tag.findByIdAndDelete(tagId);
    if (!check) {
      return res
        .status(404)
        .json({ success: false, message: "tag Id Not Found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "tag Deleted Successfully !" });
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
        .json({ success: false, message: "tagIds Missing" });
    }

    const result = await Tag.updateMany(
      { _id: { $in: ids } },
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: `${ids.length} tag Deleted Successfully !`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Soft Delete
const softDeleteTag = async (req, res) => {
  try {
    const tag = await Tag.findByIdAndUpdate(
      req.params.id,
      {
        isDeleted: true,
        deletedAt: new Date(),
      },
      { new: true }
    );

    if (!tag) {
      return res.status(404).json({ success: false, message: "Tag not found" });
    }

    res.json({
      success: true,
      message: "Tag Deleted",
      tag,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getTagData,
  getTagById,
  addTag,
  updateTag,
  deleteTag,
  bulkDelete,
  softDeleteTag,
};
