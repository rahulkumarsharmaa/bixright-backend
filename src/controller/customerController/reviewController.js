const reviewModel = require("../../models/reviewModel");
const mongoose = require("mongoose");

exports.addReview = async (req, res) => {
  try {
    const customer = req.user.id;
    const { product, rating, comment } = req.body;

    if (!product || !customer || !rating || !comment) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const newReview = new reviewModel({ product, customer, rating, comment });
    await newReview.save();

    res.status(201).json({
      message: "Review added successfully!",
      review: newReview,
    });
  } catch (error) {
    console.error("Error adding review:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

exports.getReviewsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    let { page = 1, limit = 10 } = req.query;

    page = Number(page);
    limit = Number(limit);

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product ID." });
    }

    // --- Aggregation pipeline ---
    const [result] = await reviewModel.aggregate([
      {
        $match: {
          product: new mongoose.Types.ObjectId(productId),
          isDeleted: false,
        },
      },
      {
        $facet: {
          reviews: [
            { $sort: { createdAt: -1 } },
            { $skip: (page - 1) * limit },
            { $limit: limit },
            {
              $lookup: {
                from: "customers",
                localField: "customer",
                foreignField: "_id",
                as: "customerDetails",
              },
            },
            { $unwind: "$customerDetails" },
            {
              $project: {
                _id: 1,
                rating: 1,
                comment: 1,
                createdAt: 1,
                customerName: {
                  $concat: [
                    "$customerDetails.firstName",
                    " ",
                    "$customerDetails.lastName",
                  ],
                },
              },
            },
          ],
          totalCount: [{ $count: "count" }],
          averageRating: [
            { $group: { _id: null, avgRating: { $avg: "$rating" } } },
          ],
        },
      },
      {
        $project: {
          reviews: 1,
          totalCount: { $arrayElemAt: ["$totalCount.count", 0] },
          averageRating: {
            $round: [{ $arrayElemAt: ["$averageRating.avgRating", 0] }, 1],
          },
        },
      },
    ]);

    res.status(200).json({
      message: "Reviews fetched successfully!",
      totalReviews: result.totalCount || 0,
      averageRating: result.averageRating || 0,
      currentPage: page,
      totalPages: Math.ceil((result.totalCount || 0) / limit),
      reviews: result.reviews || [],
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};
