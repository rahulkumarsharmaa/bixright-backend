const apiPrefix = "/customer-api";
module.exports = (app) => {
  app.use(`${apiPrefix}/category`, require("./categoryRoute"));
  app.use(`${apiPrefix}/product`, require("./productRoute"));
  app.use(`${apiPrefix}/customer`, require("./customerRoute"));
};
