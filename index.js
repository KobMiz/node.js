const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes");
const cardRoutes = require("./routes/cardRoutes");
const ticketRoutes = require("./routes/tickets");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swaggerConfig");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

// MongoDB URI selection based on environment
const MONGO_URI =
  NODE_ENV === "production"
    ? process.env.MONGO_URI_PROD
    : process.env.MONGO_URI;

console.log(`Running in ${NODE_ENV} mode`);

// MongoDB connection
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log(
      `Connected to MongoDB: ${
        MONGO_URI.includes("mongodb+srv") ? "Atlas" : "Local"
      }`
    );
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

mongoose.connection.on("connected", () =>
  console.log("Mongoose connected to DB")
);
mongoose.connection.on("error", (err) =>
  console.error(`Mongoose connection error: ${err}`)
);
mongoose.connection.on("disconnected", () =>
  console.log("Mongoose disconnected")
);

// Morgan logging
app.use(morgan(NODE_ENV === "development" ? "dev" : "tiny"));

// CORS configuration
const allowedOrigins =
  NODE_ENV === "development"
    ? ["http://localhost:3000"]
    : ["https://your-production-domain.com"];
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

// JSON body parser
app.use(express.json());

// Routes
app.use("/users", userRoutes);
app.use("/cards", cardRoutes);
app.use("/tickets", ticketRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Default route
app.get("/", (req, res) => res.send("Server is running!"));

// 404 handler
app.use((req, res) => res.status(404).json({ error: "Not Found" }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(err.status || 500)
    .json({ error: err.message || "Internal Server Error" });
});

// Start server
app.listen(PORT, () =>
  console.log(`Server is running on http://localhost:${PORT}`)
);
