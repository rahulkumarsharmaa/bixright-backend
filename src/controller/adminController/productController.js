const cloudinary = require("../../config/cloudinaryConfig");
const {
  generateProductVariants,
} = require("../../helpers/generateProductVariants");

const Brand = require("../../models/brandModel");
const Category = require("../../models/categoryModel");
const Color = require("../../models/colourModel");
const Product = require("../../models/productModel");
const Size = require("../../models/sizeModel");
const SubCategory = require("../../models/subCategoryModel");

const getProductData = async (req, res) => {
  try {
    console.log("product controller", req.user);
    const product = await Product.find({ isDeleted: false });
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

    if (product.isDeleted === true) {
      return res.status(404).json({
        success: false,
        message: "No Product Found",
      });
    }

    return res
      .status(200)
      .json({ success: true, message: "product Fetched", product });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error.message);
  }
};

// const addProduct = async (req, res) => {
//   console.log("body", req.body);
//   console.log("file", req.file);
//   try {
//     const {
//       title,
//       subTitle,
//       description,
//       brand,
//       category,
//       subCategory,
//       size,
//       color,
//       basePrice,
//     } = req.body;

//     console.log(req.body);

//     if (
//       !title ||
//       !description ||
//       !basePrice ||
//       !category ||
//       !size ||
//       !color ||
//       !brand
//     ) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Details Missing: Please provide title, description, price, quantity, category, size, and brand.",
//       });
//     }

//     const productImages = [];

//     const uploadToCloudinary = (fileBuffer) => {
//       return new Promise((resolve, reject) => {
//         const stream = cloudinary.uploader.upload_stream(
//           { folder: "products" },
//           (error, result) => {
//             if (error) return reject(error);
//             resolve(result);
//           }
//         );
//         stream.end(fileBuffer);
//       });
//     };

//     if (req.files && req.files.length > 0) {
//       for (let i = 0; i < req.files.length; i++) {
//         const file = req.files[i];

//         const result = await uploadToCloudinary(file.buffer);
//         const imageObject = {
//           imageUrl: result.secure_url,
//           imageId: result.public_id,
//           // Set the first image in the array as the cover image
//           isCover: i === 0,
//         };

//         // Add the structured image object to the array
//         productImages.push(imageObject);
//       }
//     } else {
//       console.log("No images provided for the product.");
//     }

//     const brandData = await Brand.findById(brand);

//     if (!brandData) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Brand not found" });
//     }

//     const categoryData = await Category.findById(category);

//     if (!categoryData) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Category not found" });
//     }

//     const subCategoryData = await SubCategory.findById(subCategory);

//     if (!subCategoryData) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Sub Category not found" });
//     }

//     const sizeData = await Size.find({ _id: { $in: size } });
//     if (sizeData.length !== size.length) {
//       return res
//         .status(400)
//         .json({ success: false, message: "One or more sizes are invalid" });
//     }

//     // Check colors
//     const colorData = await Color.find({ _id: { $in: color } });
//     if (colorData.length !== color.length) {
//       return res
//         .status(400)
//         .json({ success: false, message: "One or more colors are invalid" });
//     }

//     console.log(sizeData);
//     console.log(colorData);

//     const sizesToSave = sizeData.map((s) => ({ id: s._id }));
//     const colorsToSave = colorData.map((c) => ({ id: c._id }));

//     console.log(sizesToSave);
//     console.log(colorsToSave);

//     const product = new Product({
//       title,
//       subTitle,
//       description,
//       basePrice,
//       brand: {
//         id: brandData?._id,
//         name: brandData?.title,
//       },
//       category: {
//         id: categoryData?._id,
//         name: categoryData?.title,
//       },
//       subCategory: {
//         id: subCategoryData?._id,
//         name: subCategoryData?.title,
//       },
//       size: sizesToSave,
//       color: colorsToSave,
//       images: productImages,
//     });

//     await generateProductVariants(product);

//     await product.save();

//     return res.status(200).json({
//       success: true,
//       message: "Product Created Successfully!",
//       product: product,
//     });
//   } catch (error) {
//     console.error("Error creating product:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Server Error: Could not create product.",
//     });
//   }
// };

const addProduct = async (req, res) => {
  try {
    const {
      title,
      subTitle,
      description,
      brand,
      category,
      subCategory,
      size,
      color,
      basePrice,
    } = req.body;

    // Validate required fields
    if (
      !title ||
      !description ||
      !basePrice ||
      !category ||
      !size ||
      !color ||
      !brand
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Details Missing: Please provide title, description, price, category, size, color, and brand.",
      });
    }

    // Normalize size and color to arrays
    const sizeArr = Array.isArray(size) ? size : [size].filter(Boolean);
    const colorArr = Array.isArray(color) ? color : [color].filter(Boolean);

    // Fetch and validate brand, category, subcategory
    const brandData = await Brand.findById(brand);
    if (!brandData)
      return res
        .status(400)
        .json({ success: false, message: "Brand not found" });

    const categoryData = await Category.findById(category);
    if (!categoryData)
      return res
        .status(400)
        .json({ success: false, message: "Category not found" });

    const subCategoryData = await SubCategory.findById(subCategory);
    if (!subCategoryData)
      return res
        .status(400)
        .json({ success: false, message: "Sub Category not found" });

    // Validate sizes
    const sizeData = await Size.find({ _id: { $in: sizeArr } });
    if (sizeData.length !== sizeArr.length)
      return res
        .status(400)
        .json({ success: false, message: "One or more sizes are invalid" });

    // Validate colors
    const colorData = await Color.find({ _id: { $in: colorArr } });
    if (colorData.length !== colorArr.length)
      return res
        .status(400)
        .json({ success: false, message: "One or more colors are invalid" });

    // Handle image uploads
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
        productImages.push({
          imageUrl: result.secure_url,
          imageId: result.public_id,
          isCover: i === 0,
        });
      }
    }

    // Prepare product document
    const product = new Product({
      title,
      subTitle,
      description,
      basePrice,
      brand: { id: brandData._id, name: brandData.title },
      category: { id: categoryData._id, name: categoryData.title },
      subCategory: { id: subCategoryData._id, name: subCategoryData.title },
      size: sizeData.map((s) => ({ id: s._id })),
      color: colorData.map((c) => ({ id: c._id })),
      images: productImages,
    });

    // Generate product variants
    await generateProductVariants(product);

    // Save product
    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product Created Successfully!",
      product,
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

// const updateProduct = async (req, res) => {
//   console.log("body", req.body);
//   console.log("file", req.file);

//   const productId = req.params.id;
//   const { brand, imagesToDelete, ...updateFields } = req.body;

//   try {
//     if (!productId) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Product ID Missing" });
//     }

//     if (brand) {
//       const brandData = await Brand.findById(brand);
//       if (!brandData) {
//         return res
//           .status(400)
//           .json({ success: false, message: "Brand not found for update" });
//       }

//       updateFields.brand = {
//         id: brandData._id,
//         name: brandData.title,
//       };
//     }

//     //  --- Handle Image Deletions (Cloudinary & Database) ---
//     if (imagesToDelete) {
//       const idsToDelete = imagesToDelete
//         .split(",")
//         .map((id) => id.trim())
//         .filter((id) => id.length > 0);

//       // Delete from Cloudinary and remove from the Mongoose document
//       for (const imageId of idsToDelete) {
//         try {
//           // Call Cloudinary delete API
//           await cloudinary.uploader.destroy(imageId);
//           console.log(`Cloudinary deletion successful for: ${imageId}`);

//           await Product.findByIdAndUpdate(productId, {
//             $pull: { images: { imageId: imageId } },
//           });
//         } catch (error) {
//           console.error(
//             `Failed to delete image ID ${imageId} from Cloudinary or DB:`,
//             error
//           );
//         }
//       }
//     }

//     // Handle New Image Uploads (Cloudinary & Database) ---

//     const newImages = [];
//     if (req.files && req.files.length > 0) {
//       for (let i = 0; i < req.files.length; i++) {
//         const file = req.files[i];
//         const result = await uploadToCloudinary(file.buffer);

//         const imageObject = {
//           imageUrl: result.secure_url,
//           imageId: result.public_id,

//           isCover: false,
//           // Use a high sort order if needed, or rely on array insertion order
//         };
//         newImages.push(imageObject);
//       }

//       // Push all new images to the product's 'images' array
//       await Product.findByIdAndUpdate(productId, {
//         $push: { images: { $each: newImages } },
//       });
//     }

//     const product = await Product.findByIdAndUpdate(
//       productId,
//       { $set: updateFields },
//       { new: true, runValidators: true }
//     );

//     if (!product) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Product not found after update." });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Product and Images Updated Successfully",
//       product,
//     });
//   } catch (error) {
//     console.error("Error during product update:", error);
//     res
//       .status(500)
//       .json({ success: false, message: "Server Error: " + error.message });
//   }
// };

const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    if (!productId) {
      return res
        .status(400)
        .json({ success: false, message: "Product ID missing" });
    }

    let {
      title,
      subTitle,
      description,
      basePrice,
      brand,
      category,
      subCategory,
      size,
      color,
      imagesToDelete,
      status,
      isVisible,
    } = req.body;

    // Prepare update object
    const updateData = {};

    // ---------- BASIC FIELDS ----------
    if (title) updateData.title = title;
    if (subTitle) updateData.subTitle = subTitle;
    if (description) updateData.description = description;
    if (basePrice) updateData.basePrice = basePrice;
    if (status) updateData.status = status;
    if (typeof isVisible !== "undefined") updateData.isVisible = isVisible;

    // ---------- BRAND ----------
    if (brand) {
      const brandData = await Brand.findById(brand);
      if (!brandData)
        return res
          .status(400)
          .json({ success: false, message: "Brand not found" });
      updateData.brand = { id: brandData._id, name: brandData.title };
    }

    // ---------- CATEGORY ----------
    if (category) {
      const catData = await Category.findById(category);
      if (!catData)
        return res
          .status(400)
          .json({ success: false, message: "Category not found" });
      updateData.category = { id: catData._id, name: catData.title };
    }

    // ---------- SUB CATEGORY ----------
    if (subCategory) {
      const subCatData = await SubCategory.findById(subCategory);
      if (!subCatData)
        return res
          .status(400)
          .json({ success: false, message: "Subcategory not found" });
      updateData.subCategory = { id: subCatData._id, name: subCatData.title };
    }

    // ---------- SIZE ----------
    if (size) {
      const sizeArr = Array.isArray(size) ? size : size.split(",");
      const sizeData = await Size.find({ _id: { $in: sizeArr } });
      if (sizeData.length !== sizeArr.length)
        return res
          .status(400)
          .json({ success: false, message: "Invalid sizes provided" });
      updateData.size = sizeData.map((s) => ({ id: s._id }));
    }

    // ---------- COLOR ----------
    if (color) {
      const colorArr = Array.isArray(color) ? color : color.split(",");
      const colorData = await Color.find({ _id: { $in: colorArr } });
      if (colorData.length !== colorArr.length)
        return res
          .status(400)
          .json({ success: false, message: "Invalid colors provided" });
      updateData.color = colorData.map((c) => ({ id: c._id }));
    }

    // ---------- DELETE IMAGES ----------
    if (imagesToDelete) {
      const ids = imagesToDelete.split(",");
      for (let publicId of ids) {
        await cloudinary.uploader.destroy(publicId);
        await Product.findByIdAndUpdate(productId, {
          $pull: { images: { imageId: publicId } },
        });
      }
    }

    // ---------- ADD NEW IMAGES ----------
    if (req.files && req.files.length > 0) {
      const uploadedImages = [];
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer);
        uploadedImages.push({
          imageUrl: result.secure_url,
          imageId: result.public_id,
          isCover: false, // default, can later let admin set cover
        });
      }
      if (!updateData.$push) updateData.$push = {};
      updateData.$push.images = { $each: uploadedImages };
    }

    // ---------- UPDATE PRODUCT ----------
    let product = await Product.findByIdAndUpdate(productId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    // ---------- REGENERATE VARIANTS ----------
    // If size or color changed, regenerate variants
    if ((size && size.length > 0) || (color && color.length > 0)) {
      await generateProductVariants(product);
      product = await Product.findById(productId); // get updated variants
    }

    // ---------- HANDLE COVER IMAGE ----------
    // If product has no cover image, automatically assign the first image as cover
    if (product.images && product.images.length > 0) {
      const hasCover = product.images.some((img) => img.isCover);
      if (!hasCover) {
        product.images[0].isCover = true;
        await product.save();
      }
    }

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (err) {
    console.error("Update error:", err);
    return res.status(500).json({ success: false, message: err.message });
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

    const result = await Product.updateMany(
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
      message: `${ids.length} Product Deleted Successfully !`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Soft Delete Product
const softDeleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        isDeleted: true,
        deletedAt: new Date(),
      },
      { new: true }
    );

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.json({
      success: true,
      message: "Product Deleted",
      product,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getProductData,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
  bulkDelete,
  softDeleteProduct,
};
