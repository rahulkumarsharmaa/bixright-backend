const apiPrefix = "/customer-api";
module.exports = (app) => {
  app.use(`${apiPrefix}/category`, require("./categoryRoute"));
  app.use(`${apiPrefix}/product`, require("./productRoute"));
  app.use(`${apiPrefix}/customer`, require("./customerRoute"));
  app.use(`${apiPrefix}/banner`, require("./bannerRoutes"));
  app.use(`${apiPrefix}/wishlist`, require("./wishlistRoutes"));
  app.use(`${apiPrefix}/order`, require("./orderRoutes"));
};
