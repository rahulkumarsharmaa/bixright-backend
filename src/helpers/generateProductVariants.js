const Color = require("../models/colourModel");
const Size = require("../models/sizeModel");
const Variant = require("../models/variantModel");
const crypto = require("crypto");

const generateProductVariants = async (product) => {
  const sizeIds = product.size.map((s) => s.id);
  const colorIds = product.color.map((c) => c.id);

  const sizes = await Size.find({ _id: { $in: sizeIds } });
  const colors = await Color.find({ _id: { $in: colorIds } });

  console.log(product);
  console.log(sizes);
  console.log(colors);


  const variantsToSave = [];

  colors.forEach((c) => {
    sizes.forEach((s) => {
      const randomCode = crypto.randomBytes(2).toString("hex").toUpperCase();
      variantsToSave.push({
        product: product._id,
        color: c.title,
        size: s.title,
        sku: `${c.title}-${s.title}-${randomCode}`,
        price: product.basePrice,
        discountedPrice: product.discountedPrice,
        quantity: 0,
        status: "instock",
      });
    });
  });

  await Variant.insertMany(variantsToSave);
  console.log(
    `Generated ${variantsToSave.length} variants for product ${product.title}`
  );
};

module.exports = { generateProductVariants };
