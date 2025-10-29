// server.js - CORRECTED VERSION FOR CLOUD RUN DEPLOYMENT

const express = require('express');
const cors = require('cors');

// --- Import Factory Functions & Routers ---
const loadConfig = require('./utils/config'); 
const createDbPool = require('./awsdb');      
const createTransporter = require('./utils/mailer'); 
const createPerplexityService = require('./services/generateWithPerplexity'); 
const authRoutes = require('./routes/auth');       // Auth router factory
const statsRoutes = require('./routes/stats');     // Stats router factory
const extractRoute = require('./routes/extract');  // Extract router factory
const generateRoute = require('./routes/generate'); // Generate router factory (descriptive)
const mcqGenerateRoute = require('./routes/generate-mcq'); // New MCQ router factory
const answerKeyRoute = require('./routes/generateAnswer'); // Answer Key router factory
const mcqAnswerKeyRoute = require('./routes/generate-mcq-answer');
const supportRoute = require('./routes/support'); // Support router factory 
const slackAlertRoute = require('./routes/slack'); // Slack alert router factory
const userRoutes = require('./routes/user'); // User management router factory
const s3Upload = require('./routes/s3Upload');
const createTokenAuthMiddleware = require('./utils/middleware'); 

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
    const protect = createTokenAuthMiddleware(db);
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

    // CRITICAL: Ensure Health Check is defined before app.listen()
    app.get('/health', (req, res) => {
      res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
    });
    
    // 5. PROTECT ROUTES THAT REQUIRE AUTHORIZATION

    app.use(protect);
    app.use('/api', extractRoute);
    app.use('/api', generateRoute(perplexityService)); // Original descriptive route
    app.use('/api', mcqGenerateRoute(perplexityService)); // New MCQ route
    app.use('/api', answerKeyRoute(perplexityService));
    app.use('/api', mcqAnswerKeyRoute(perplexityService));
    app.use('/api', supportRoute(transporter, config));
    app.use('/api', slackAlertRoute(config));
    app.use('/api/user', userRoutes(db));
    app.use('/api', s3Upload(config, db));
    
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
      console.log(`📍 Descriptive questions: http://localhost:${PORT}/api/generate-questions`);
      console.log(`📍 MCQ questions: http://localhost:${PORT}/api/generate-mcq-questions`);
    });

  } catch (error) {
    // This will catch any fatal errors during the startup process.
    console.error('❌ Fatal error during server startup:', error);
    process.exit(1); // Exit the process with a failure code
  }
}

// Run the application
startServer();
