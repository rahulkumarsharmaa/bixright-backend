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

app.get("/", (req, res) => {
  res.send("Home");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on PORT : ${PORT}`);
});
