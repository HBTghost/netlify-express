const express = require("express");
const morgan = require("morgan");
const dotenv = require("dotenv");
const serverless = require("serverless-http");

// Load env
dotenv.config({ path: "./process.env" });

const app = express();

// Dev logging
if (process.env.NODE_ENV === "dev") {
  app.use(morgan("dev"));
}

// Lazy load routes
// app.use("/api/genDateStrings", require("./routes/genDateStrings.js"))
app.use("/.netlify/functions/api/result", require("./routes/result.js"));

// app.use(`/.netlify/functions/api`, router);

module.exports = app;
module.exports.handler = serverless(app);
