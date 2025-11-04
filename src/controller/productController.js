const cloudinary = require("../config/cloudinaryConfig");
const Brand = require("../models/brandModel");
const Product = require("../models/productModel");

const getProductData = async (req, res) => {
  try {
    const product = await Product.find();
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "No product Found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "product Fetched", product });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.message);
  }
};

const getProductById = async (req, res) => {
  const id = req.params;
  console.log(id);

  if (!id) {
    return res
      .status(404)
      .json({ success: false, message: "No productId provided" });
  }

  try {
    const product = await Product.findById(id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "No product Found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "product Fetched", product });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.message);
  }
};

const addProduct = async (req, res) => {
  try {
    const {
      title,
      subTitle,
      description,
      price,
      discount,
      category,
      size,
      brand,
      quantity,
      status,
    } = req.body;

    if (!title || !subTitle || !description || !price || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Details Missing !",
      });
    }

    let imageUrl = "";
    let imageId = "";

    if (req.file) {
      // Wrap the stream upload in a Promise
      const uploadToCloudinary = (fileBuffer) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "products" },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );
          stream.end(fileBuffer);
        });
      };

      const result = await uploadToCloudinary(req.file.buffer);
      imageUrl = result.secure_url;
      imageId = result.public_id;
    }

    const brandData = await Brand.findById(brand);

    if (!brandData) {
      return res
        .status(400)
        .json({ success: false, message: "Brand not found" });
    }

    const product = new Product({
      title,
      subTitle,
      description,
      price,
      discount,
      category,
      size,
      brand : {
        id : brandData._id,
        name : brandData.title
      },
      quantity,
      status,
      imageUrl,
      imageId,
    });

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product Created Successfully !",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const data = req.body;
    console.log(data);

    if (!productId) {
      return res
        .status(400)
        .json({ success: false, message: "productId Missing" });
    }

    const product = await Product.findByIdAndUpdate(productId, data, {
      new: true,
    });

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Product Updated Successfully",
      product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    if (!productId) {
      return res
        .status(400)
        .json({ success: false, message: "productId Missing" });
    }

    const check = await Product.findByIdAndDelete(productId);
    if (!check) {
      return res
        .status(404)
        .json({ success: false, message: "Product Id Not Found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Product Deleted Successfully !" });
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
        .json({ success: false, message: "productIds Missing" });
    }

    const result = await Product.deleteMany({ _id: { $in: ids } });

    return res.status(200).json({
      success: true,
      message: `${ids.length} Product Deleted Successfully !`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getProductData,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
  bulkDelete,
};
