// import { Router } from 'express';
// import { AuthController } from '../controllers/AuthController';

// import { loginValidation } from '../middleware/validationMiddleware';
// import { AuthMiddleware } from '../middleware/AuthMiddleware';

// export class AuthRoutes {
//   public router: Router;

//   constructor(
//     private authController: AuthController,
//     private authMiddleware: AuthMiddleware
//   ) {
//     this.router = Router();
//     this.initializeRoutes();
//   }

//   private initializeRoutes(): void {
//     /**
//      * @swagger
//      * /auth/login:
//      *   post:
//      *     tags: [Authentication]
//      *     summary: User login
//      *     description: Authenticate user with email and password. Returns JWT token in response body and sets it as httpOnly cookie.
//      *     requestBody:
//      *       required: true
//      *       content:
//      *         application/json:
//      *           schema:
//      *             type: object
//      *             required:
//      *               - email
//      *               - password
//      *             properties:
//      *               email:
//      *                 type: string
//      *                 format: email
//      *                 example: admin@example.com
//      *               password:
//      *                 type: string
//      *                 example: admin123
//      *     responses:
//      *       200:
//      *         description: Login successful
//      *         headers:
//      *           Set-Cookie:
//      *             description: JWT token set as httpOnly cookie
//      *             schema:
//      *               type: string
//      *         content:
//      *           application/json:
//      *             schema:
//      *               type: object
//      *               properties:
//      *                 success:
//      *                   type: boolean
//      *                   example: true
//      *                 message:
//      *                   type: string
//      *                   example: Login successful
//      *                 data:
//      *                   type: object
//      *                   properties:
//      *                     token:
//      *                       type: string
//      *                       description: JWT token for authorization header
//      *                     expiresAt:
//      *                       type: string
//      *                       format: date-time
//      *       401:
//      *         description: Invalid credentials
//      *       400:
//      *         description: Validation error
//      */
//     this.router.post('/login', loginValidation, this.authController.login);

//     /**
//      * @swagger
//      * /auth/logout:
//      *   post:
//      *     tags: [Authentication]
//      *     summary: User logout
//      *     description: Clear JWT cookie and invalidate session
//      *     security:
//      *       - bearerAuth: []
//      *       - cookieAuth: []
//      *     responses:
//      *       200:
//      *         description: Logout successful
//      *         content:
//      *           application/json:
//      *             schema:
//      *               type: object
//      *               properties:
//      *                 success:
//      *                   type: boolean
//      *                   example: true
//      *                 message:
//      *                   type: string
//      *                   example: Logout successful
//      *       401:
//      *         description: Authentication required
//      */
//     this.router.post('/logout', this.authMiddleware.authenticate, this.authController.logout);

//     /**
//      * @swagger
//      * /auth/profile:
//      *   get:
//      *     tags: [Authentication]
//      *     summary: Get current user profile
//      *     description: Get authenticated user's profile information
//      *     security:
//      *       - bearerAuth: []
//      *       - cookieAuth: []
//      *     responses:
//      *       200:
//      *         description: Profile retrieved successfully
//      *         content:
//      *           application/json:
//      *             schema:
//      *               type: object
//      *               properties:
//      *                 success:
//      *                   type: boolean
//      *                   example: true
//      *                 message:
//      *                   type: string
//      *                   example: Profile retrieved successfully
//      *                 data:
//      *                   $ref: '#/components/schemas/AuthUser'
//      *       401:
//      *         description: Authentication required
//      */
//     this.router.get('/profile', this.authMiddleware.authenticate, this.authController.profile);
//   }
// }