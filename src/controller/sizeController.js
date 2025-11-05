const Size = require("../models/sizeModel");
const getSizeData = async (req, res) => {
  try {
    const size = await Size.find();
    if (!size) {
      return res
        .status(404)
        .json({ success: false, message: "No size Found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Size Fetched", size });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.message);
  }
};

const getSizeById = async (req, res) => {
  const id = req.params;
  console.log(id);

  try {
    const size = await Size.findById(id);
    if (!size) {
      return res
        .status(404)
        .json({ success: false, message: "No size Found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "size Fetched", size });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.message);
  }
};

const addSize = async (req, res) => {
  try {
    console.log(req.body)
    const { title, code, description, status } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Details Missing !",
      });
    }

    const lowerTitle = title.toLowerCase()

    const existingTitle = await Size.findOne({title : lowerTitle})
    if(existingTitle){
       return res.status(400).json({
        success: false,
        message: "Size Already Exist !",
      });

    }

    // const lowerCode = code?.toLowerCase()

    // const existingCode = await Size.findOne({code : lowerCode})
    // if(existingCode){
    //    return res.status(400).json({
    //     success: false,
    //     message: "Size Code Already Exist !",
    //   });
    // }

    const size = new Size({
      title,
      code,
      description,
      status,
    });

    await size.save();

    return res.status(200).json({
      success: true,
      message: "Size Created Successfully !",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateSize = async (req, res) => {
  try {
    const sizeId = req.params.id;
    const data = req.body;
    console.log(data);

    if (!sizeId) {
      return res
        .status(400)
        .json({ success: false, message: "SizeId Missing" });
    }

    const size = await Size.findByIdAndUpdate(sizeId, data, {
      new: true,
    });

    if (!size) {
      return res
        .status(404)
        .json({ success: false, message: "Size not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Size Updated Successfully",
      size,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteSize = async (req, res) => {
  try {
    const sizeId = req.params.id;

    if (!sizeId) {
      return res
        .status(400)
        .json({ success: false, message: "SizeId Missing" });
    }

    const check = await Size.findByIdAndDelete(sizeId);
    if (!check) {
      return res
        .status(404)
        .json({ success: false, message: "Size Id Not Found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Size Deleted Successfully !" });
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
        .json({ success: false, message: "SizeIds Missing" });
    }

    const result = await Size.deleteMany({ _id: { $in: ids } });

    return res.status(200).json({
      success: true,
      message: `${ids.length} Size Deleted Successfully !`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getSizeData,
  getSizeById,
  addSize,
  updateSize,
  deleteSize,
  bulkDelete,
};
