const apiPrefix = "/app-api";
module.exports = (app) => {
  app.use(`${apiPrefix}/customer`, require("./customerRoutes"));
};
