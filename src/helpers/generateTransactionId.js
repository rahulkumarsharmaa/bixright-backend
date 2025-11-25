const pincodeSearch = require("india-pincode-search");
const pincodeModel = require("../models/pincodeModel");

const generateTransactionId = () => {
  const digits = Math.floor(100000000000 + Math.random() * 900000000000);
  return `TXN-${digits}`;
};

const importPincodes = async () => {
  try {
    console.log("⏳ Fetching all pincodes...");
    const allData = pincodeSearch.search ? pincodeSearch.search() : [];
    console.log(allData);
    const data = allData.map((code) => {
      // console.log(code);
      return {
        code: code.pincode || "",
        area: code.district || code.village || "",
        city: code.city || "",
        state: code.state || "",
        isActive: true,
      };
    });
    console.log(data, "pppppp");
    await pincodeModel.deleteMany();
    await pincodeModel.insertMany(data);
    // const formattedData = allData.map((item) => ({
    //   code: item.pincode,
    //   area: item.district || item.village,
    //   city: item.city || "",
    //   state: item.state || "",
    //   isActive: true,
    // }));

    // console.log(`📦 Preparing to insert ${formattedData} pincodes...`);

    // await pincodeModel.insertMany(formattedData);

    console.log("✅ All pincodes imported successfully");
  } catch (err) {
    console.error("❌ Error importing pincodes:", err);
    process.exit(1);
  }
};

module.exports = { generateTransactionId, importPincodes };
