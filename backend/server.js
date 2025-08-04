// server.js

const express = require('express');
const cors = require('cors');

// --- Import Factory Functions & Routers ---
const loadConfig = require('./utils/config'); // Your async config loader
const createDbPool = require('./awsdb');      // Factory for the DB pool
const createTransporter = require('./utils/mailer'); // Factory for the mail transporter
const createPerplexityService = require('./services/generateWithPerplexity'); 
const authRoutes = require('./routes/auth');       // Auth router factory
const statsRoutes = require('./routes/stats');     // Stats router factory
const extractRoute = require('./routes/extract');  // Extract router factory
const generateRoute = require('./routes/generate'); // Generate router factory
const answerKeyRoute = require('./routes/generateAnswer'); // Answer Key router factory
const supportRoute = require('./routes/support'); // Support router factory 
const slackAlertRoute = require('./routes/slack'); // Slack alert router factory
const userRoutes = require('./routes/user'); // User management router factory

/**
 * Main function to initialize services and start the Express server.
 */
async function startServer() {
  try {
    // 1. LOAD CONFIGURATION
    // This is the first and most critical step.
    const config = await loadConfig();
    console.log('✅ Configuration loaded successfully.');

    // 2. INITIALIZE SERVICES
    // Create dependencies that rely on the loaded configuration.
    const db = createDbPool(config);
    const transporter = createTransporter(config);

    // 3. CREATE EXPRESS APP
    const app = express();

    // 4. SET UP GLOBAL MIDDLEWARE
    app.use(cors({
      origin: ['http://localhost:8080', 'http://localhost:3000', config.FRONTEND_URL],
      credentials: true
    }));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Simple request logger
    app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
      next();
    });

    const perplexityService = createPerplexityService(config);

    app.use('/api/auth', authRoutes(db, transporter, config));
    app.use('/api', statsRoutes(db, config));
    app.use('/api', extractRoute);
    app.use('/api', generateRoute(perplexityService));
    app.use('/api', answerKeyRoute(perplexityService));
    app.use('/api', supportRoute(transporter, config));
    app.use('/api', slackAlertRoute(config));
    app.use('/api/user', userRoutes(db));
    
    // --- System Routes ---
    app.get('/health', (req, res) => {
      res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
    });
    
    // 6. SET UP FINAL ERROR HANDLING MIDDLEWARE
    // This should be the last middleware you use.
    app.use((err, req, res, next) => {
      console.error('Unhandled Error:', err);
      res.status(500).json({ message: 'An internal server error occurred.' });
    });

    // 7. START THE SERVER
    const PORT = config.PORT || 3001;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server is running on port ${PORT}`);
      console.log(`📍 Health check available at http://localhost:${PORT}/health`);
    });

  } catch (error) {
    // This will catch any fatal errors during the startup process.
    console.error('❌ Fatal error during server startup:', error);
    process.exit(1); // Exit the process with a failure code
  }
}

// Run the application
startServer();