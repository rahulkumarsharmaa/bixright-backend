const Review = require("../../models/reviewModel");
const getReviewData = async (req, res) => {
  try {
    const review = await Review.find({ isDeleted: false }).populate('product', 'title').populate('customer', 'firstName lastName');
    if (!review || review.length === 0) {
      return res
        .status(200)
        .json({ success: true, message: "No Review Found", review: [] });
    }

    return res
      .status(200)
      .json({ success: true, message: "Review Fetched", review });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.message);
  }
};

const getReviewById = async (req, res) => {
  const id = req.params;
  console.log(id);

  try {
    const review = await Review.findById(id);
    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: "No review Found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "review Fetched", review });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.message);
  }
};

const addReview = async (req, res) => {
  try {
    console.log(req.body);
    const { productId, customerId, rating, comment } = req.body;

    if (!productId || !customerId || !rating) {
      return res.status(400).json({
        success: false,
        message: "Details Missing !",
      });
    }

    if (rating < 0 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Invalid Rating !",
      });
    }

    const review = new Review({
      productId,
      customerId,
      rating,
      comment,
    });

    await review.save();

    return res.status(200).json({
      success: true,
      message: "Review Created Successfully !",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateReview = async (req, res) => {
  try {
    const reviewId = req.params.id;
    const data = req.body;
    console.log(data);

    if (!reviewId) {
      return res
        .status(400)
        .json({ success: false, message: "ReviewId Missing" });
    }

    const review = await Review.findByIdAndUpdate(reviewId, data, {
      new: true,
    });

    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Review Updated Successfully",
      review,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    const reviewId = req.params.id;

    if (!reviewId) {
      return res
        .status(400)
        .json({ success: false, message: "ReviewId Missing" });
    }

    const check = await Review.findByIdAndDelete(reviewId);
    if (!check) {
      return res
        .status(404)
        .json({ success: false, message: "Review Id Not Found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Review Deleted Successfully !" });
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
        .json({ success: false, message: "ReviewIds Missing" });
    }

    const result = await Review.updateMany(
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
      message: `${ids.length} Review Deleted Successfully !`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Soft Delete
const softDeleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      {
        isDeleted: true,
        deletedAt: new Date(),
      },
      { new: true }
    );

    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }

    res.json({
      success: true,
      message: "Review Deleted",
      review,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getReviewData,
  getReviewById,
  addReview,
  updateReview,
  deleteReview,
  bulkDelete,
  softDeleteReview
};
