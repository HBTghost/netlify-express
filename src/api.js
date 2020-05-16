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

// Cors
app.use((req, res, next) => {
  res.append('Access-Control-Allow-Origin', '*');
  next();
});

// Lazy load routes
// app.use("/api/genDateStrings", require("./routes/genDateStrings.js"))
app.use("/.netlify/functions/api/result", require("./routes/result.js"));

// Choose port
const port = process.env.PORT || 7070;

// Listen
app.listen(port, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${port}`);
})

module.exports = app;
module.exports.handler = serverless(app);
