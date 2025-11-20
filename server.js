const express = require("express");
const dotenv = require("dotenv").config();
const cors = require("cors");
const dbConnection = require("./src/config/dbConfig");
const authRoute = require("./src/routes/authRoute");
const adminRoute = require("./src/routes/admin/index.js");
const app = express();
dbConnection();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoute);
app.use("/api/admin", adminRoute);
require("./src/routes/customer/index.js")(app);
require("./src/routes/app/index.js")(app);

app.get("/", (req, res) => {
  res.send("Home");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT,'0.0.0.0', () => {
  console.log(`Server running on PORT : ${PORT}`);
});
