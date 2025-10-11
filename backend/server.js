// server.js
const cookieParser = require('cookie-parser');
const express = require('express');
const cors = require('cors');
//const bodyParser = require('body-parser');


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
const s3Upload = require('./routes/s3Upload');
const createTokenAuthMiddleware = require('./utils/middleware'); 
const googleLoginRoute = require('./routes/googleLoginRoute');
const googleSignupRoute = require("./routes/googleSignupRoute");
const EncryptPDF = require("./routes/EncryptPDF")
const sendPDFEmail = require("./routes/sendPDFEmail")
const creditsHandling = require("./routes/creditsHandling");

/**
 * Main function to initialize services and start the Express server.
 */
async function startServer() {
  try {
    // 1. LOAD CONFIGURATION (MUST SUCCEED)
    const config = await loadConfig();
    console.log('✅ Configuration loaded successfully.');

    // 2. INITIALIZE SERVICES (DECOUPLED)
    // CRITICAL FIX: The factory functions must be NON-BLOCKING on startup.
    // They should return the pool/client instance, which will only error 
    // when the first actual query is attempted.
    const db = createDbPool(config);        // If this blocks, it will crash the app.
    const transporter = createTransporter(config);
    const protect = createTokenAuthMiddleware(db);
    const perplexityService = createPerplexityService(config);

    // 3. CREATE EXPRESS APP
    const app = express();

    // 4. SET UP GLOBAL MIDDLEWARE
    app.use(cors({
      origin: "*", 
     // origin: ['http://localhost:8080', 'https://vinathaal.azhizen.com']// your frontends
      credentials: true,
    }));



    // Important for Google OAuth popups    
    {/*app.use((req, res, next) => {
      res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
      res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
      next();
    });*/}

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    //app.use(cookieParser());
    //app.use(bodyParser.json());

    // Simple request logger
    app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
      next();
    });

    const perplexityService = createPerplexityService(config);

    //api's which doesn't require authorization
    app.use("/api", creditsHandling(db));
    app.use("/api", sendPDFEmail(config));
    app.use('/api/auth', authRoutes(db, transporter, config));
    app.use("/api", EncryptPDF());
    app.use('/api', statsRoutes(db, config));
    app.get('/health', (req, res) => {
      // The health check must respond immediately without hitting the DB
      res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
    });
    
    // 5. DEFINE ROUTES (Routes will crash ONLY when called if the DB is down)

    // APIs which don't require authorization
    app.use('/api/auth', authRoutes(db, transporter, config));
    app.use('/api', statsRoutes(db, config));

    // PROTECTED ROUTES
    app.use(protect);
    app.use('/api', extractRoute);
    app.use('/api', generateRoute(perplexityService));
    app.use('/api', answerKeyRoute(perplexityService));
    app.use('/api', supportRoute(transporter, config));
    app.use('/api', slackAlertRoute(config));
    app.use('/api/user', userRoutes(db));
    app.use('/api', s3Upload(config, db));
    
    // --- System Routes ---
    
    app.use('/api/user', userRoutes(db)); 
    app.use("/api", googleLoginRoute);
    app.use("/api", googleSignupRoute(config));

    app.get("/", (req, res) => {
      res.send("Server is running...");
    });






    // --- System Routes ---
    app.get('/health', (req, res) => {
      res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
    });

    // 6. SET UP FINAL ERROR HANDLING MIDDLEWARE
    app.use((err, req, res, next) => {
      console.error('Unhandled Error:', err);
      res.status(500).json({ message: 'An internal server error occurred.' });
    });

    // 7. START THE SERVER (The order is critical for Cloud Run!)
    // CRITICAL FIX: Always use process.env.PORT provided by the platform.
    const PORT = process.env.PORT || 8080; // Cloud Run injects the port here
    
    // The listen call must succeed to pass the health check. Bind to 0.0.0.0.
    app.listen(PORT, '0.0.0.0', () => { 
      console.log(`✅ Server is running on port ${PORT}`);
      console.log(`📍 Health check available at http://localhost:${PORT}/health`);
    });

  } catch (error) {
    // This catches fatal errors during server setup and exits the container
    console.error('❌ Fatal error during server startup:', error);
    process.exit(1);
  }
}

// Run the application
startServer();