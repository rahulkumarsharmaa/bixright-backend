const apiPrefix = "/api/customer-api";
module.exports = (app) => {
  app.use(`${apiPrefix}/category`, require("./categoryRoute"));
  app.use(`${apiPrefix}/product`, require("./productRoute"));
  app.use(`${apiPrefix}/customer`, require("./customerRoute"));
  app.use(`${apiPrefix}/banner`, require("./bannerRoutes"));
  app.use(`${apiPrefix}/wishlist`, require("./wishlistRoutes"));
  app.use(`${apiPrefix}/order`, require("./orderRoutes"));
  app.use(`${apiPrefix}/cart`, require("./cartRoute"));
  app.use(`${apiPrefix}/review`, require("./reviewsRoute"));
  app.use(`${apiPrefix}/tags`, require("./tagRoute"));
  app.use(`${apiPrefix}/policy`, require("./policyRoute"));
  app.use(`${apiPrefix}/site-setting`, require("./siteSettingRoutes"));
    app.use(`${apiPrefix}/popup`, require("./popupRoute"));
};
