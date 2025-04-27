// Load environment variables
require('dotenv').config();

// Import dependencies
const logger = require("./utils/logger");
const connectDB = require("./utils/database");
const app = require('./app');
const routes = require('./routes');
const mongoose = require('mongoose');
const net = require('net');

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Validate required environment variables
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];
requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    logger.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
});

// Log environment information
console.log('Current Directory:', __dirname);
console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('MONGO_URI:', process.env.MONGO_URI);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api', routes);

// Global error handler
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ 
      status: 'error',
      message: 'Invalid JSON format' 
    });
  }
  logger.error(`Global error: ${err.message}`);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
});

// Handle 404
app.all('*', (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server`,
    timestamp: new Date().toISOString()
  });
});

// Start the server
const startServer = async () => {
  try {
    // Connect to MongoDB
    logger.info('Attempting to connect to MongoDB...');
    const db = await connectDB();
    if (!db || !db.connection) {
      throw new Error('Failed to establish a database connection');
    }
    logger.info(`MongoDB connected: ${db.connection.host}`);

    // Server configuration
    let PORT = process.env.PORT || 5000;
    const NODE_ENV = process.env.NODE_ENV || 'development';
    
    // Check if port is available
    const isPortAvailable = await checkPortAvailability(PORT);
    if (!isPortAvailable) {
      // Try next available port
      for (let i = 1; i <= 10; i++) {
        const nextPort = PORT + i;
        if (await checkPortAvailability(nextPort)) {
          PORT = nextPort;
          logger.info(`Original port ${process.env.PORT} was in use, switched to port ${PORT}`);
          break;
        }
      }
    }
    
    const server = app.listen(PORT, () => {
      logger.info(`Server running in ${NODE_ENV} mode on port ${PORT}`);
      logger.info(`API ready at: http://localhost:${PORT}/api`);
      logger.info(`Server started at: ${new Date().toISOString()}`);
    });

    // Graceful shutdown
    const shutdown = () => {
      logger.info('Received shutdown signal...');
      server.close(async () => {
        logger.info('Server closed');
        if (db.connection) {
          await db.connection.close();
          logger.info('Database connection closed');
        }
        process.exit(0);
      });

      // Force shutdown if not closed in time
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

    // Handle server errors
    server.on('error', (error) => {
      logger.error(`Server error: ${error.message}`);
      process.exit(1);
    });

  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  logger.error('Unhandled Promise Rejection:', error.message || error);
  process.exit(1);
});

// Run the server
startServer();

const checkPortAvailability = (port) => {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(false);
      } else {
        reject(err);
      }
    });
    
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    
    server.listen(port);
  });
};


