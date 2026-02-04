import express, { Application } from 'express';
import cors from 'cors';
import { config, validateConfig } from './config';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { rateLimiter, apiKeyAuth } from './middleware/security';

// Validate configuration on startup
try {
    validateConfig();
    console.log('✓ Configuration validated successfully');
} catch (error) {
    console.error('Configuration validation failed:', error);
    process.exit(1);
}

const app: Application = express();

// CORS configuration
const corsOptions = {
    origin: config.security.allowedOrigins === '*'
        ? '*'
        : config.security.allowedOrigins.split(','),
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: `${config.security.maxFileSizeMB}mb` }));
app.use(express.urlencoded({ extended: true, limit: `${config.security.maxFileSizeMB}mb` }));

// Rate limiting
app.use(rateLimiter);

// API Key Authentication
app.use(apiKeyAuth);

// Request logging in development
if (config.server.nodeEnv === 'development') {
    app.use((req, _res, next) => {
        console.log(`${req.method} ${req.url}`);
        next();
    });
}

// Routes
app.use(routes);

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const PORT = config.server.port;

const server = app.listen(PORT, () => {
    console.log(`
========================================
🖼️  Image Splitter API Server
========================================

Status: Running
Port: ${PORT}
Environment: ${config.server.nodeEnv}
Max File Size: ${config.security.maxFileSizeMB}MB

Endpoints:
  • GET  /health
  • POST /api/split

========================================
  `);
});

// Graceful shutdown
const gracefulShutdown = (signal: string) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    server.close(() => {
        console.log('Server closed. Exiting process.');
        process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
        console.error('Forced shutdown after timeout');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default app;
