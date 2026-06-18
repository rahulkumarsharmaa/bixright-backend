const fs = require('fs');
const path = require('path');
const {
  generateProductVariants,
} = require("../../helpers/generateProductVariants");

const Brand = require("../../models/brandModel");
const Category = require("../../models/categoryModel");
const Color = require("../../models/colourModel");
const Product = require("../../models/productModel");
const Size = require("../../models/sizeModel");
const SubCategory = require("../../models/subCategoryModel");
const Tag = require("../../models/tagModel");

const getProductData = async (req, res) => {
  try {
    let { page = 1, limit = 10, search = "", status } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    const filter = { isDeleted: false }; // Base filter

    // Search Filter
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { subTitle: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Status Filter
    if (status) {
      if (status === "true" || status === "active") {
        filter.isActive = true;
      } else if (status === "false" || status === "inactive") {
        filter.isActive = false;
      }
    }

    // Explicitly populate references if needed, though they are stored as objects {id, name} in the model usually, 
    // but looking at addProduct, they are stored as embedded objects {id, name}. 
    // So find() should be enough.

    // However, the Product model usage in addProduct shows:
    // brand: { id: brandData._id, name: brandData.title }
    // So no need to populate.

    const product = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Product.countDocuments(filter);

    return res.status(200).json({
      success: true,
      message: product.length === 0 ? "No product found" : "Products Fetched",
      data: {
        data: product,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      // Keep 'product' key for backward compatibility if needed temporarily, 
      // but ideally we switch to data.data.
      // The frontend will be updated to use data.data.data.
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getProductById = async (req, res) => {
  const { id } = req.params;
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

const deleteLocalFile = (filePath) => {
  if (!filePath) return;
  if (filePath.startsWith("http")) return; // Ignore URLs or Cloudinary paths

  // filePath is expected to be relative like "uploads\filename..." or "uploads/filename..."
  // resolving it from current directory is tricky if we don't know where PWD is.
  // Ideally use process.cwd() or similar.
  const fullPath = path.resolve(filePath);

  fs.unlink(fullPath, (err) => {
    if (err) console.error("Failed to delete local file:", fullPath, err);
    // else console.log("Deleted local file:", fullPath);
  });
};

const addProduct = async (req, res) => {
  try {
    const {
      title,
      subTitle,
      description,
      details,
      brand,
      category,
      subCategory,
      size,
      color,
      basePrice,
      discount,
      tags,
      type, // 'single' or 'variant'
      stock,
    } = req.body;

    console.log(req.body, "product add body");

    // Validate required fields
    if (
      !title ||
      !description ||
      basePrice === undefined || basePrice === null ||
      !category ||
      !brand ||
      discount === undefined || discount === null
    ) {
      return res.status(400).json({
        success: false,
        message: "Details Missing",
      });
    }

    // Default to 'simple' if not provided
    const productType = type || "simple";

    // Normalize size and color to arrays
    const sizeArr = Array.isArray(size) ? size : (size ? [size] : []);
    const colorArr = Array.isArray(color) ? color : (color ? [color] : []);
    const tagsArr = Array.isArray(tags) ? tags : (tags ? [tags] : []);

    // Logic based on Product Type
    const isVariantProduct = productType === "variant";

    // Validate size and color ONLY if it is a variant product
    if (isVariantProduct) {
      if (sizeArr.length === 0 && colorArr.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Variant Product must have at least one size or color selected."
        });
      }
    } else {
      // Logic for SIMPLE product
      if (stock === undefined || stock === null || stock < 0) {
        return res.status(400).json({
          success: false,
          message: "Simple Product must have a valid stock quantity."
        });
      }
    }

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

    let subCategoryData = null;
    if (subCategory && subCategory !== "") {
      subCategoryData = await SubCategory.findById(subCategory);
      if (!subCategoryData)
        return res
          .status(400)
          .json({ success: false, message: "Sub Category not found" });
    }

    // Validate sizes if present and it's a variant product
    let sizeData = [];
    if (isVariantProduct && sizeArr.length > 0) {
      sizeData = await Size.find({ _id: { $in: sizeArr } });
      if (sizeData.length !== sizeArr.length)
        return res
          .status(400)
          .json({ success: false, message: "One or more sizes are invalid" });
    }

    // Validate colors if present and it's a variant product
    let colorData = [];
    if (isVariantProduct && colorArr.length > 0) {
      colorData = await Color.find({ _id: { $in: colorArr } });
      if (colorData.length !== colorArr.length)
        return res
          .status(400)
          .json({ success: false, message: "One or more colors are invalid" });
    }

    let tagData = [];
    if (tags) {
      tagData = await Tag.find({ _id: { $in: tagsArr } });
      if (tagData.length !== tagsArr.length)
        return res
          .status(400)
          .json({ success: false, message: "One or more tags are invalid" });
    }

    // Handle image uploads (Local Storage)
    const productImages = [];

    // req.files is array of file objects from multer diskStorage
    // Each file has 'path' property like 'uploads/filename.ext'
    if (req.files && req.files.length > 0) {
      const baseUrl = process.env.BACKEND_URL;

      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];

        // Normalize windows paths
        let fileUrl = file.path.replace(/\\/g, "/");

        const fullUrl = `${baseUrl}/${fileUrl}`;

        productImages.push({
          imageUrl: fullUrl,
          imageId: file.path, // Store local path as ID for easier deletion later
          isCover: i === 0,
        });
      }
    }

    let discountPercentage = discount || 0;
    let discountedPrice = Math.round(
      basePrice * (1 - (discountPercentage || 0) / 100)
    );

    // Prepare product document
    const product = new Product({
      title,
      subTitle,
      description,
      details,
      basePrice,
      brand: { id: brandData._id, name: brandData.title },
      category: { id: categoryData._id, name: categoryData.title },
      subCategory: subCategoryData
        ? { id: subCategoryData._id, name: subCategoryData.title }
        : undefined,
      size: sizeData.map((s) => ({ id: s._id })),
      color: colorData.map((c) => ({ id: c._id })),
      tags: tagData.map((t) => ({ id: t._id, name: t.title })),
      images: productImages,
      discount: discountPercentage,
      discountedPrice: discountedPrice,
      type: productType,
      stock: isVariantProduct ? 0 : Number(stock), // Save stock for simple product, 0 for variant (variants manage their own)
    });

    // Generate product variants ONLY if it is a variant product
    if (isVariantProduct) {
      await generateProductVariants(product);
    }

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
  console.log("body", req.body);
  console.log("discount", req.body.discount);
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
      discount,
      brand,
      category,
      subCategory,
      size,
      color,
      imagesToDelete,
      coverIndex,
      isActive,
      isVisible,
      tags,
      stock, // Add stock here
      // type is usually not editable after creation, but if allowed:
      // type, 
    } = req.body;

    // Fetch existing product to check type
    const existingProduct = await Product.findById(productId);
    if (!existingProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    const updateData = {};

    // ---------- BASIC FIELDS ----------
    if (title) updateData.title = title;
    if (subTitle) updateData.subTitle = subTitle;
    if (description) updateData.description = description;
    if (basePrice) updateData.basePrice = basePrice;
    if (discount) updateData.discount = discount;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (typeof isVisible !== "undefined") updateData.isVisible = isVisible;

    // Update stock only if product is simple
    if (existingProduct.type === 'simple' && stock !== undefined) {
      updateData.stock = Number(stock);
    }

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
    if (subCategory && subCategory !== "") {
      const subCatData = await SubCategory.findById(subCategory);
      if (!subCatData)
        return res
          .status(400)
          .json({ success: false, message: "Subcategory not found" });
      updateData.subCategory = { id: subCatData._id, name: subCatData.title };
    } else if (subCategory === "") {
      // Explicitly clear subCategory if empty string passed
      updateData.subCategory = undefined;
    }

    // ---------- SIZE (only if product is a variant type) ----------
    if (existingProduct.type === "variant" && size) {
      const sizeArr = Array.isArray(size) ? size : size.split(",");
      const sizeData = await Size.find({ _id: { $in: sizeArr } });
      if (sizeData.length !== sizeArr.length)
        return res
          .status(400)
          .json({ success: false, message: "Invalid sizes provided" });
      updateData.size = sizeData.map((s) => ({ id: s._id }));
    }

    // ---------- COLOR (only if product is a variant type) ----------
    if (existingProduct.type === "variant" && color) {
      const colorArr = Array.isArray(color) ? color : color.split(",");
      const colorData = await Color.find({ _id: { $in: colorArr } });
      if (colorData.length !== colorArr.length)
        return res
          .status(400)
          .json({ success: false, message: "Invalid colors provided" });
      updateData.color = colorData.map((c) => ({ id: c._id }));
    }

    // ---------- TAG ----------

    if (tags) {
      const tagsArr = Array.isArray(tags) ? tags : tags.split(",");
      const tagsData = await Tag.find({ _id: { $in: tagsArr } });
      if (tagsData.length !== tagsArr.length)
        return res
          .status(400)
          .json({ success: false, message: "Invalid tags provided" });
      updateData.tags = tagsData.map((t) => ({ id: t._id, name: t.title }));
    }

    // ---------- DELETE IMAGES (Local) ----------
    if (imagesToDelete) {
      console.log("imagestodelete", imagesToDelete);
      const ids = Array.isArray(imagesToDelete)
        ? imagesToDelete
        : imagesToDelete.split(",").filter(Boolean);

      console.log("ids", ids);
      for (const imageId of ids) {
        // Here imageId is the filePath we stored, e.g. "uploads\filename..."
        deleteLocalFile(imageId);
      }

      await Product.findByIdAndUpdate(productId, {
        $pull: { images: { imageId: { $in: ids } } },
      });
    }

    // ---------- ADD NEW IMAGES (Local) ----------
    let pushData = {};
    if (req.files && req.files.length > 0) {
      console.log("files", req.files);
      const uploadedImages = [];
      const baseUrl = process.env.BACKEND_URL;

      for (const file of req.files) {
        // storage logic same as addProduct
        let fileUrl = file.path.replace(/\\/g, "/");
        const fullUrl = `${baseUrl}/${fileUrl}`;

        uploadedImages.push({
          imageUrl: fullUrl,
          imageId: file.path,
          isCover: false,
        });
      }
      pushData.$push = { images: { $each: uploadedImages } };
    }

    // ---------- UPDATE PRODUCT ----------
    let product = await Product.findByIdAndUpdate(
      productId,
      { $set: updateData, ...pushData },
      { new: true, runValidators: true }
    );

    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    // ---------- REGENERATE VARIANTS (Only if variant type) ----------
    if (product.type === "variant") {
      // If sizes or colors changed, regenerate
      if ((size && size.length > 0) || (color && color.length > 0)) {
        await generateProductVariants(product);
        product = await Product.findById(productId);
      }
    }

    // ---------- HANDLE COVER IMAGE ----------
    if (coverIndex !== undefined && product.images[coverIndex]) {
      product.images.forEach(
        (img, idx) => (img.isCover = idx === parseInt(coverIndex, 10))
      );
      await product.save();
    } else if (product.images && !product.images.some((img) => img.isCover)) {
      product.images[0].isCover = true;
      await product.save();
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
