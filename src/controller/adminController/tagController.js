const Tag = require("../../models/tagModel");

const getTagData = async (req, res) => {
  try {
    const tag = await Tag.find();
    if (!tag) {
      return res.status(404).json({ success: false, message: "No tag Found" });
    }

    return res.status(200).json({ success: true, message: "tag Fetched", tag });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.message);
  }
};

const getTagById = async (req, res) => {
  const id = req.params;
  console.log(id);

  try {
    const tag = await Tag.findById(id);
    if (!tag) {
      return res.status(404).json({ success: false, message: "No tag Found" });
    }

    return res.status(200).json({ success: true, message: "tag Fetched", tag });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.message);
  }
};

const addTag = async (req, res) => {
  try {
    console.log(req.body);
    const { title, status } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Details Missing !",
      });
    }

    const lowerTitle = title.toLowerCase();

    const existing = await Tag.findOne({ title: lowerTitle });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Tag Already Exist !",
      });
    }

    const tag = new Tag({
      title,
      status,
    });

    await tag.save();

    return res.status(200).json({
      success: true,
      message: "Tag Created Successfully !",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateTag = async (req, res) => {
  try {
    const tagId = req.params.id;
    const data = req.body;
    console.log(data);

    if (!tagId) {
      return res.status(400).json({ success: false, message: "tagId Missing" });
    }

    const tag = await Tag.findByIdAndUpdate(tagId, data, {
      new: true,
    });

    if (!tag) {
      return res.status(404).json({ success: false, message: "tag not found" });
    }

    return res.status(200).json({
      success: true,
      message: "tag Updated Successfully",
      tag,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
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

    const result = await Tag.deleteMany({ _id: { $in: ids } });

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
      return res
        .status(404)
        .json({ success: false, message: "Tag not found" });
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
