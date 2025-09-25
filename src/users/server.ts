// import dotenv from 'dotenv';
// import { App } from './app';

// // Load environment variables
// dotenv.config();

// const PORT = process.env.PORT || 3000;

// // For Vercel serverless functions
// let app: App;

// async function getApp(): Promise<App> {
//   if (!app) {
//     app = new App();
//     await app.initialize();
//   }
//   return app;
// }

// // For Vercel serverless deployment
// export default async function handler(req: any, res: any) {
//   const appInstance = await getApp();
//   return appInstance.getApp()(req, res);
// }

// // For local development
// if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
//   startServer();
// }

// async function startServer(): Promise<void> {
//   try {
//     const app = new App();
    
//     // Initialize the application
//     await app.initialize();
    
//     // Start the server
//     const server = app.getApp().listen(PORT, () => {
//       console.log(`
// 🚀 Server is running!
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🌐 URL: http://localhost:${PORT}
// 📚 Documentation: http://localhost:${PORT}/api-docs
// 🩺 Health Check: http://localhost:${PORT}/health
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Default Users Created:
// 👤 Admin: ${process.env.DEFAULT_ADMIN_EMAIL || 'admin@example.com'} / ${process.env.DEFAULT_ADMIN_PASSWORD || 'admin123'}
// 👤 User: ${process.env.DEFAULT_USER_EMAIL || 'user@example.com'} / ${process.env.DEFAULT_USER_PASSWORD || 'user123'}

// Authentication Methods:
// 🍪 Cookie: Login sets httpOnly cookie automatically
// 🔑 Bearer: Use 'Authorization: Bearer <token>' header
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//       `);
//     });

//     // Graceful shutdown handling
//     process.on('SIGTERM', async () => {
//       console.log('SIGTERM received, shutting down gracefully...');
//       server.close(async () => {
//         await app.cleanup();
//         console.log('✅ Server closed successfully');
//         process.exit(0);
//       });
//     });

//     process.on('SIGINT', async () => {
//       console.log('SIGINT received, shutting down gracefully...');
//       server.close(async () => {
//         await app.cleanup();
//         console.log('✅ Server closed successfully');
//         process.exit(0);
//       });
//     });

//     // Handle uncaught exceptions
//     process.on('uncaughtException', (error) => {
//       console.error('Uncaught Exception:', error);
//       process.exit(1);
//     });

//     process.on('unhandledRejection', (reason, promise) => {
//       console.error('Unhandled Rejection at:', promise, 'reason:', reason);
//       process.exit(1);
//     });

//   } catch (error) {
//     console.error('❌ Failed to start server:', error);
//     process.exit(1);
//   }
// }