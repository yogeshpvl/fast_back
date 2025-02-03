const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();
const cookieParser = require("cookie-parser");


mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() =>
    console.log("=============MongoDb Database connected successfuly")
  )
  .catch((err) => console.log("Database Not connected !!!", err));

//middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(morgan("dev"));
app.use(express.static("public"));

const adminLogin = require("./route/Auth/adminLogin");
const agentAuth = require("./route/Auth/agentAuth");
const tags = require("./route/tags");
const banner = require("./route/banner");


app.use("/api/subpartner", adminLogin);
app.use("/api/agent", agentAuth);
app.use("/api/tags", tags);
app.use("/api/banner", banner);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log("Server is running on", PORT);
});
