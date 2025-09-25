// import express, { Application } from 'express';
// import cors from 'cors';
// import helmet from 'helmet';
// import cookieParser from 'cookie-parser';
// import rateLimit from 'express-rate-limit';
// import swaggerUi from 'swagger-ui-express';
// import path from 'path';
// import fs from 'fs';

// import { Container } from './infrastructure/container/Container';
// import { errorHandler, notFoundHandler } from './presentation/middleware/errorMiddleware';
// import { swaggerSpec } from './infrastructure/config/swagger';

// export class App {
//   private app: Application;
//   private container: Container;

//   constructor() {
//     this.app = express();
//     this.container = Container.getInstance();
//     this.initializeMiddleware();
//     this.initializeRoutes();
//     this.initializeErrorHandling();
//   }

//   private initializeMiddleware(): void {
//     // Trust proxy for Vercel/production environments
//     if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
//       this.app.set('trust proxy', 1);
//     }

//     // CORS first
//     this.app.use(cors({
//       origin: process.env.CORS_ORIGIN ?
//         process.env.CORS_ORIGIN.split(',').map(origin => origin.trim()) :
//         'http://localhost:3000',
//       credentials: true, // Allow cookies
//       methods: ['GET', 'POST', 'PUT', 'DELETE'],
//       allowedHeaders: ['Content-Type', 'Authorization']
//     }));

//     // Custom middleware to disable CSP for API docs
//     this.app.use((req, res, next) => {
//       if (req.path.startsWith('/api-docs')) {
//         // Remove any CSP headers for Swagger UI
//         res.removeHeader('Content-Security-Policy');
//         res.removeHeader('X-Content-Security-Policy');
//         res.removeHeader('X-WebKit-CSP');
//         res.removeHeader('X-Content-Security-Policy-Report-Only');
//       }
//       next();
//     });

//     // Security middleware - completely disable CSP for now
//     this.app.use(helmet({
//       contentSecurityPolicy: false,
//       crossOriginEmbedderPolicy: false
//     }));

//     // Rate limiting with proper proxy configuration
//     const limiter = rateLimit({
//       windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
//       max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
//       message: {
//         success: false,
//         message: 'Too many requests from this IP, please try again later'
//       },
//       // Skip rate limiting in development or if no proxy is configured
//       skip: (req) => {
//         return process.env.NODE_ENV === 'development' && !req.ip;
//       },
//       // Use standard rate limit headers
//       standardHeaders: true,
//       legacyHeaders: false
//     });
//     this.app.use(limiter);

//     // Body parsing
//     this.app.use(express.json({ limit: '10mb' }));
//     this.app.use(express.urlencoded({ extended: true }));
//     this.app.use(cookieParser());
//   }

//   private initializeRoutes(): void {
//     // Health check endpoint
//     this.app.get('/health', async (req, res) => {
//       try {
//         const isHealthy = await this.container.checkDatabaseHealth();
//         const status = isHealthy ? 200 : 503;
        
//         res.status(status).json({
//           success: isHealthy,
//           message: isHealthy ? 'Service is healthy' : 'Service unhealthy',
//           timestamp: new Date().toISOString(),
//           database: isHealthy ? 'connected' : 'disconnected',
//           environment: process.env.NODE_ENV || 'development',
//           vercel: !!process.env.VERCEL
//         });
//       } catch (error) {
//         res.status(503).json({
//           success: false,
//           message: 'Service unhealthy',
//           timestamp: new Date().toISOString(),
//           database: 'disconnected',
//           environment: process.env.NODE_ENV || 'development',
//           vercel: !!process.env.VERCEL,
//           error: process.env.NODE_ENV === 'development' ? String(error) : undefined
//         });
//       }
//     });

//     // SOLUTION: Serve swagger-ui-dist static files directly
//     const swaggerUiAssetPath = path.join(__dirname, '../node_modules/swagger-ui-dist');
    
//     // Serve swagger UI static assets with correct MIME types
//     this.app.use('/api-docs', express.static(swaggerUiAssetPath, {
//       index: false,
//       setHeaders: (res, filePath) => {
//         // Remove CSP headers for static files too
//         res.removeHeader('Content-Security-Policy');
//         res.removeHeader('X-Content-Security-Policy');
//         res.removeHeader('X-WebKit-CSP');
        
//         // Ensure correct MIME types
//         if (filePath.endsWith('.css')) {
//           res.setHeader('Content-Type', 'text/css');
//         }
//         if (filePath.endsWith('.js')) {
//           res.setHeader('Content-Type', 'application/javascript');
//         }
//         if (filePath.endsWith('.map')) {
//           res.setHeader('Content-Type', 'application/json');
//         }
//       }
//     }));

//     // Alternative approach: Read CSS and inject as customCss
//     let customCss = '';
//     try {
//       const cssPath = path.join(__dirname, '../node_modules/swagger-ui-dist/swagger-ui.css');
//       if (fs.existsSync(cssPath)) {
//         customCss = fs.readFileSync(cssPath, 'utf8');
//       }
//     } catch (error) {
//       console.warn('Could not read swagger-ui.css:', error);
//     }

//     // Setup Swagger UI with enhanced options
//     this.app.use('/api-docs', swaggerUi.serve);
//     this.app.get('/api-docs', (req, res, next) => {
//       // Ensure no CSP headers on the main Swagger page
//       res.removeHeader('Content-Security-Policy');
//       res.removeHeader('X-Content-Security-Policy');
//       res.removeHeader('X-WebKit-CSP');
      
//       const swaggerHandler = swaggerUi.setup(
//         swaggerSpec,
//         {
//           explorer: true,
//           customCssUrl: process.env.NODE_ENV === 'production' 
//             ? '/api-docs/swagger-ui.css' 
//             : undefined,
//           swaggerOptions: {
//             url: '/api-docs/swagger.json',
//             persistAuthorization: true,
//             displayRequestDuration: true,
//             tryItOutEnabled: true,
//             // Force relative URLs for API calls
//             requestInterceptor: (req: any) => {
//               // Ensure all API calls use relative URLs
//               if (req.url.startsWith('http')) {
//                 const url = new URL(req.url);
//                 req.url = url.pathname + url.search;
//               }
//               return req;
//             }
//           }
//         },
//         undefined, // options parameter
//         customCss, // customCss parameter
//         undefined, // customfavIcon parameter
//         undefined, // swaggerUrl parameter
//         'User Auth API Documentation' // customSiteTitle parameter
//       );
      
//       swaggerHandler(req, res, next);
//     });

//     // Serve swagger spec as JSON
//     this.app.get('/api-docs/swagger.json', (req, res) => {
//       res.removeHeader('Content-Security-Policy');
//       res.setHeader('Content-Type', 'application/json');
//       res.send(swaggerSpec);
//     });

//     // API routes
//     this.app.use('/auth', this.container.authRoutes.router);
//     this.app.use('/users', this.container.userRoutes.router);

//     // Root endpoint
//     this.app.get('/', (req, res) => {
//       res.json({
//         success: true,
//         message: 'User Authentication Microservice API',
//         version: '1.0.0',
//         documentation: '/api-docs',
//         health: '/health',
//         deployment: {
//           platform: process.env.VERCEL ? 'Vercel' : 'Self-hosted',
//           environment: process.env.NODE_ENV || 'development'
//         }
//       });
//     });
//   }

//   private initializeErrorHandling(): void {
//     // 404 handler
//     this.app.use(notFoundHandler);

//     // Global error handler
//     this.app.use(errorHandler);
//   }

//   public getApp(): Application {
//     return this.app;
//   }

//   public async initialize(): Promise<void> {
//     await this.container.initializeDatabase();
//   }

//   public async cleanup(): Promise<void> {
//     await this.container.cleanup();
//   }
// }