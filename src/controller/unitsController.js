const Unit = require("../models/unitsModel");
const getUnitData = async (req, res) => {
  try {
    const unit = await Unit.find();
    if (!unit) {
      return res
        .status(404)
        .json({ success: false, message: "No Unit Found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Unit Fetched", unit });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.message);
  }
};

const getUnitById = async (req, res) => {
  const id = req.params;
  console.log(id);

  try {
    const unit = await Unit.findById(id);
    if (!unit) {
      return res
        .status(404)
        .json({ success: false, message: "No Unit Found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Unit Fetched", unit });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.message);
  }
};

const addUnit = async (req, res) => {
  try {
    console.log(req.body)
    const { name, status } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Details Missing !",
      });
    }

    const lowerName = name.toLowerCase()

    const existing = await Unit.findOne({name : lowerName})
    if(existing){
       return res.status(400).json({
        success: false,
        message: "Unit Already Exist !",
      });

    }

    const unit = new Unit({
      name : lowerName,
      status,
    });

    await unit.save();

    return res.status(200).json({
      success: true,
      message: "Unit Created Successfully !",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateUnit = async (req, res) => {
  try {
    const unitId = req.params.id;
    const data = req.body;
    console.log(data);

    if (!unitId) {
      return res
        .status(400)
        .json({ success: false, message: "unitId Missing" });
    }

    const unit = await Unit.findByIdAndUpdate(unitId, data, {
      new: true,
    });

    if (!unit) {
      return res
        .status(404)
        .json({ success: false, message: "Unit not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Unit Updated Successfully",
      unit,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteUnit = async (req, res) => {
  try {
    const unitId = req.params.id;

    if (!unitId) {
      return res
        .status(400)
        .json({ success: false, message: "UnitId Missing" });
    }

    const check = await Unit.findByIdAndDelete(unitId);
    if (!check) {
      return res
        .status(404)
        .json({ success: false, message: "Unit Id Not Found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Unit Deleted Successfully !" });
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
        .json({ success: false, message: "UnitIds Missing" });
    }

    const result = await Unit.deleteMany({ _id: { $in: ids } });

    return res.status(200).json({
      success: true,
      message: `${ids.length} Unit Deleted Successfully !`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getUnitData,
  getUnitById,
  addUnit,
  updateUnit,
  deleteUnit,
  bulkDelete,
};
