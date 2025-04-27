const mongoose = require("mongoose");
const logger = require("./logger");

/**
 * Establishes a connection to MongoDB using the URI from environment variables
 * Includes error handling and debug feedback
 */
const connectDB = async () => {
  try {
    // Get MongoDB URI from environment variables
    const mongoURI = process.env.MONGO_URI;  // Changed from MONGODB_URI to MONGO_URI

    if (!mongoURI) {
      logger.error("MongoDB URI is missing in environment variables");
      throw new Error("MongoDB URI is not defined");
    }

    // Connection options
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    // Connect to MongoDB
    logger.info("Attempting to connect to MongoDB...");
    const conn = await mongoose.connect(mongoURI, options);

    logger.info(`MongoDB connected: ${conn.connection.host}`);

    // Set up event listeners for connection issues
    mongoose.connection.on("error", (err) => {
      logger.error(`MongoDB connection error: ${err}`);
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB disconnected");
    });

    mongoose.connection.on("reconnected", () => {
      logger.info("MongoDB reconnected");
    });

    // Handle Node.js process termination
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      logger.info("MongoDB connection closed due to app termination");
      process.exit(0);
    });

    return conn;
  } catch (err) {
    logger.error(`MongoDB connection error: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
