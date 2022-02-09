const path = require("path");
const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp"); 
const cookieParser = require("cookie-parser");
const compression = require("compression");
const cron = require("node-cron");

const cronHandler = require("./controllers/cronHandler");
const cors = require("cors");

const AppError = require("./utils/appError");

const globalErrorHandler = require("./controllers/errorController");

const userRoutes = require("./routes/userRoutes");
// const transactionRoutes = require("./routes/transactionRoutes");
// const contactRoutes = require("./routes/contactRoute");
// const checkoutRoutes = require("./routes/checkoutRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

app.enable("trust proxy");

app.use(cors());

app.use(function (req, res, next) {
  res.header("Content-Type", "application/json;charset=UTF-8");
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
}); 

app.options("*", cors());

// Set security HTTP headers
app.use(helmet());

// Limit requests from same API
const limiter = rateLimit({
  max: 20000,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});
app.use("/api", limiter);

// cron.schedule("* * ")

// Body parser, reading data from body into req.body
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({ whitelist: ["duration", "ratingsQuantity", "ratingsAverage", "maxGroupSize", "difficulty", "price"] })
);

app.use(compression());

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

app.use("/api/v1/users", userRoutes);
// app.use("/api/v1/transactions", transactionRoutes);
// app.use("/api/v1/contact", contactRoutes);

// app.use("/api/v1/checkout", checkoutRoutes);
app.use("/api/v1/admin", adminRoutes);

// cron.schedule("0 0 0 * * *", cronHandler);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);
module.exports = app;
