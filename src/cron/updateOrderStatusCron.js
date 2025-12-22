const cron = require("node-cron");
const orderModel = require("../models/orderModel");

/**
 * This cron job runs once every day at midnight (00:00)
 * It checks all orders change the orderStatus to processing whose more than 24 hours
 
 */

exports.updateOrderStatus = cron.schedule(
  "0 0 * * *",
  async () => {
    try {
      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const result = await orderModel.updateMany(
        {
          createdAt: { $lt: twentyFourHoursAgo },
          orderStatus: "confirmed",
        },
        {
          $set: { orderStatus: "processing" },
        }
      );

      if (result.modifiedCount > 0) {
        console.log(`${result.modifiedCount} order Status and updated.`);
      } else {
        console.log("No Order Status changed today.");
      }
    } catch (error) {
      console.error(" Error running order status cron:", error);
    }
  },
  {
    scheduled: false, // prevent auto start, you’ll start it manually
  }
);
