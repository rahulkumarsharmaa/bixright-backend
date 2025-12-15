const mongoose = require("mongoose");
const {
  generateProductVariants,
} = require("../helpers/generateProductVariants");
const Brand = require("../models/brandModel");
const Category = require("../models/categoryModel");
const Color = require("../models/colourModel");
const Product = require("../models/productModel");
const Size = require("../models/sizeModel");
const SubCategory = require("../models/subCategoryModel");

const products = [
  {
    title: "Levi's 511 Slim Fit Jeans",
    subTitle: "Stretch Denim for Men",
    description:
      "Classic slim-fit jeans with stretch fabric for extra comfort and modern style.",
    brand: "Raymon",
    category: "Men",
    subCategory: "Jeans",
    size: ["30", "32", "34"],
    color: ["Dark Blue", "Black"],
    basePrice: 4499,
    discount: 20,
    tags: ["denim", "slim fit", "casual"],
    images: [
      {
        imageUrl:
          "https://images.unsplash.com/photo-1583002196009-8c66d63ca0f1",
        isCover: true,
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1602810317824-6be8b6f733a3",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1601933470931-3a1b42f9b266",
      },
    ],
  },

  {
    title: "Only Floral Print Dress",
    subTitle: "Women’s Summer Dress",
    description:
      "Lightweight floral printed dress perfect for casual and summer outings.",
    brand: "Only",
    category: "Women",
    subCategory: "Dresses",
    size: ["S", "M", "L"],
    color: ["Pink", "White"],
    basePrice: 2999,
    discount: 15,
    tags: ["floral", "summer", "casual"],
    images: [
      {
        imageUrl: "https://images.unsplash.com/photo-1553095066-5014bc7b7f2d",
        isCover: true,
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1576045057995-9e0a0d61b39b",
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1562158070-1d3a89a9b1f3",
      },
    ],
  },
];

const addProduct = async (req, res) => {
  try {
    if (!Array.isArray(products) || products.length === 0) {
      return {
        success: false,
        message: "Please provide an array of products.",
      };
    }

    const createdProducts = [];

    for (const item of products) {
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
        discount = 0,
      } = item;

      let ProData = await Product.findOne({ title });
      if (ProData) {
        continue;
      }

      //  Validate required fields
      if (!title || !description || !basePrice || !brand || !category) {
        console.log(`Skipping product: ${title} - Missing required fields.`);
        continue;
      }
      console.log(brand);
      // ✅ Find or Create Brand
      let brandData = await Brand.findOne({ title: brand });
      console.log(brandData, "brand111111111");
      if (!brandData) {
        brandData = await Brand.create({ title: brand });
      }
      console.log(brandData, "brandaddadadad");

      // ✅ Find or Create Category
      let categoryData = await Category.findOne({ title: category });
      if (!categoryData) {
        categoryData = await Category.create({ title: category });
      }

      // ✅ Find or Create SubCategory
      let subCategoryData = null;
      if (subCategory) {
        subCategoryData = await SubCategory.findOne({ title: subCategory });
        if (!subCategoryData) {
          subCategoryData = await SubCategory.create({
            title: subCategory,
            parentCategory: {
              id: categoryData._id,
              name: categoryData.title,
            },
          });
        }
      }

      // ✅ Find or Create Sizes
      const sizeArr = Array.isArray(size) ? size : [size];
      const sizeData = [];
      for (const s of sizeArr.filter(Boolean)) {
        let foundSize = await Size.findOne({ title: s });
        if (!foundSize) foundSize = await Size.create({ title: s, code: s });
        sizeData.push({ id: foundSize._id });
      }

      // ✅ Find or Create Colors
      const colorArr = Array.isArray(color) ? color : [color];
      const colorData = [];
      for (const c of colorArr.filter(Boolean)) {
        let foundColor = await Color.findOne({ title: c });
        if (!foundColor) foundColor = await Color.create({ title: c });
        colorData.push({ id: foundColor._id });
      }

      // ✅ Calculate discounted price
      const discountedPrice = Math.round(
        basePrice * (1 - (discount || 0) / 100)
      );

      // ✅ Create Product document
      const product = new Product({
        title,
        subTitle,
        description,
        basePrice,
        discount,
        discountedPrice,
        brand: { id: brandData._id, name: brandData.title },
        category: { id: categoryData._id, name: categoryData.title },
        subCategory: subCategoryData
          ? { id: subCategoryData._id, name: subCategoryData.title }
          : null,
        size: sizeData,
        color: colorData,
      });

      // ✅ Generate product variants (if function exists)
      if (typeof generateProductVariants === "function") {
        await generateProductVariants(product);
      }

      await product.save();
      createdProducts.push(product);
    }

    return {
      success: true,
      message: `${createdProducts.length} products added successfully.`,
      products: createdProducts,
    };
  } catch (error) {
    console.error("Error adding products:", error);
    return {
      success: false,
      message: "Server Error: Could not add products.",
    };
  }
};

(async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(
      "mongodb+srv://shyamcamlenio_db_user:hvDnnsOMAGfA6zjj@cluster0.8baum1w.mongodb.net/ecommerceadmin"
    );
    console.log("✅ MongoDB Connected");

    const data = await addProduct();
    console.log(data);
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
    process.exit(0);
  }
})();
