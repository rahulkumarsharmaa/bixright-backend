const cloudinary = require("../config/cloudinaryConfig");
const Brand = require("../models/brandModel");
const Product = require("../models/productModel");

const getProductData = async (req, res) => {
  try {
    const product = await Product.find();
    if (!product || product.length === 0) {
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
      subCategory,
      size,
      brand,
      quantity,
      status,
      isVisible,
    } = req.body;

    if (
      !title ||
      !description ||
      !price ||
      !quantity ||
      !category ||
      !size ||
      !brand
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Details Missing: Please provide title, description, price, quantity, category, size, and brand.",
      });
    }

    const productImages = [];

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

    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];

        const result = await uploadToCloudinary(file.buffer);
        const imageObject = {
          imageUrl: result.secure_url,
          imageId: result.public_id,
          // Set the first image in the array as the cover image
          isCover: i === 0,
        };

        // Add the structured image object to the array
        productImages.push(imageObject);
      }
    } else {
      console.log("No images provided for the product.");
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
      subCategory,
      size,
      brand: {
        id: brandData._id,
        name: brandData.title,
      },
      quantity,
      status,
      isVisible,

      images: productImages,
    });

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product Created Successfully!",
      product: product,
    });
  } catch (error) {
    console.error("Error creating product:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error: Could not create product.",
    });
  }
};

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

const updateProduct = async (req, res) => {
  const productId = req.params.id;
  const {
    brand, // The ID of the brand (potential change)
    imagesToDelete, // Comma-separated string of imageIds to delete
    ...updateFields // All other text fields (title, price, description, etc.)
  } = req.body;

  try {
    if (!productId) {
      return res
        .status(400)
        .json({ success: false, message: "Product ID Missing" });
    }

    if (brand) {
      const brandData = await Brand.findById(brand);
      if (!brandData) {
        return res
          .status(400)
          .json({ success: false, message: "Brand not found for update" });
      }
      // Update the brand structure within the updateFields object
      updateFields.brand = {
        id: brandData._id,
        name: brandData.title,
      };
    }

    // 2. --- Handle Image Deletions (Cloudinary & Database) ---

    if (imagesToDelete) {
      const idsToDelete = imagesToDelete
        .split(",")
        .map((id) => id.trim())
        .filter((id) => id.length > 0);

      // Delete from Cloudinary and remove from the Mongoose document
      for (const imageId of idsToDelete) {
        try {
          // Call Cloudinary delete API
          await cloudinary.uploader.destroy(imageId);
          console.log(`Cloudinary deletion successful for: ${imageId}`);

          // Use $pull to remove the object matching imageId from the 'images' array
          await Product.findByIdAndUpdate(productId, {
            $pull: { images: { imageId: imageId } },
          });
        } catch (error) {
          // Log error but continue execution for other deletions/updates
          console.error(
            `Failed to delete image ID ${imageId} from Cloudinary or DB:`,
            error
          );
        }
      }
    }

    // 3. --- Handle New Image Uploads (Cloudinary & Database) ---

    const newImages = [];
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const result = await uploadToCloudinary(file.buffer);

        // Create the new image object
        const imageObject = {
          imageUrl: result.secure_url,
          imageId: result.public_id,
          // New images are typically not designated as cover unless explicitly told,
          // or you run additional logic to set the first new image as cover
          isCover: false,
          // Use a high sort order if needed, or rely on array insertion order
        };
        newImages.push(imageObject);
      }

      // Push all new images to the product's 'images' array
      await Product.findByIdAndUpdate(productId, {
        $push: { images: { $each: newImages } },
      });
    }

    // 4. --- Update General Product Fields ---

    // Use $set operator to update only the fields present in updateFields
    const product = await Product.findByIdAndUpdate(
      productId,
      { $set: updateFields },
      { new: true, runValidators: true } // Return new document, run schema validators
    );

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found after update." });
    }

    return res.status(200).json({
      success: true,
      message: "Product and Images Updated Successfully",
      product,
    });
  } catch (error) {
    console.error("Error during product update:", error);
    res
      .status(500)
      .json({ success: false, message: "Server Error: " + error.message });
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
