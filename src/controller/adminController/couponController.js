const Coupon = require("../../models/couponModel");
const cloudinary = require("../../config/cloudinaryConfig");
const getCouponData = async (req, res) => {
  try {
    const coupon = await Coupon.find();
    if (!coupon) {
      return res
        .status(404)
        .json({ success: false, message: "No Coupon Found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Coupon Fetched", coupon });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.message);
  }
};

const getCouponById = async (req, res) => {
  const id = req.params;
  console.log(id);

  try {
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res
        .status(404)
        .json({ success: false, message: "No coupon Found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "coupon Fetched", coupon });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.message);
  }
};

const addCoupon = async (req, res) => {
  try {
    console.log(req.body);
    const {
      couponCode,
      discountType,
      description,
      discountValue,
      startDate,
      endDate,
      minOrderAmount,
      maxDiscountAmount,
      usageLimit,
      usageNumberPerUser,
    } = req.body;

    if (new Date(startDate) > new Date(endDate)) {
      return res
        .status(400)
        .json({ message: "End date must be after start date" });
    }

    // Save coupon
    const coupon = new Coupon({
      couponCode,
      discountType,
      description,
      discountValue,
      startDate,
      endDate,
      minOrderAmount,
      maxDiscountAmount,
      usageLimit,
      usageNumberPerUser,
      usedBy: [],
      usedCount: 0,
    });

    await coupon.save();

    return res.status(200).json({
      success: true,
      message: "Coupon created successfully",
      coupon,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to create coupon",
      error: error.message,
    });
  }
};

const updateCoupon = async (req, res) => {
  try {
    const couponId = req.params.id;
    const data = req.body;
    console.log(data);

    if (!couponId) {
      return res
        .status(400)
        .json({ success: false, message: "CouponId Missing" });
    }

    const coupon = await Coupon.findByIdAndUpdate(couponId, data, {
      new: true,
    });

    if (!coupon) {
      return res
        .status(404)
        .json({ success: false, message: "Coupon not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Coupon Updated Successfully",
      coupon,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteCoupon = async (req, res) => {
  try {
    const couponId = req.params.id;

    if (!couponId) {
      return res
        .status(400)
        .json({ success: false, message: "CouponId Missing" });
    }

    const check = await Coupon.findByIdAndDelete(couponId);
    if (!check) {
      return res
        .status(404)
        .json({ success: false, message: "Coupon Id Not Found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Coupon Deleted Successfully !" });
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
        .json({ success: false, message: "CouponIds Missing" });
    }

    const result = await Coupon.updateMany(
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
      message: `${ids.length} Coupon Deleted Successfully !`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Soft Delete
const softDeleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      {
        isDeleted: true,
        deletedAt: new Date(),
      },
      { new: true }
    );

    if (!coupon) {
      return res
        .status(404)
        .json({ success: false, message: "coupon not found" });
    }

    res.json({
      success: true,
      message: "Coupon Deleted",
      coupon,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCouponData,
  getCouponById,
  addCoupon,
  updateCoupon,
  deleteCoupon,
  softDeleteCoupon,
  bulkDelete,
};
