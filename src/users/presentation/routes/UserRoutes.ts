// import { Router } from 'express';
// import { UserController } from '../controllers/UserController';

// import { createUserValidation, updateUserValidation } from '../middleware/validationMiddleware';
// import { UserRole } from '../../domain/entities/User';
// import { AuthMiddleware } from '../middleware/AuthMiddleware';

// export class UserRoutes {
//   public router: Router;

//   constructor(
//     private userController: UserController,
//     private authMiddleware: AuthMiddleware
//   ) {
//     this.router = Router();
//     this.initializeRoutes();
//   }

//   private initializeRoutes(): void {
//     /**
//      * @swagger
//      * /users:
//      *   post:
//      *     tags: [Users]
//      *     summary: Create a new user (Admin only)
//      *     description: Create a new user. Only accessible by administrators.
//      *     security:
//      *       - bearerAuth: []
//      *       - cookieAuth: []
//      *     requestBody:
//      *       required: true
//      *       content:
//      *         application/json:
//      *           schema:
//      *             type: object
//      *             required:
//      *               - email
//      *               - username
//      *               - password
//      *             properties:
//      *               email:
//      *                 type: string
//      *                 format: email
//      *                 example: newuser@example.com
//      *               username:
//      *                 type: string
//      *                 minLength: 3
//      *                 maxLength: 30
//      *                 example: newuser
//      *               password:
//      *                 type: string
//      *                 minLength: 6
//      *                 example: password123
//      *               role:
//      *                 type: string
//      *                 enum: [USER, ADMIN]
//      *                 default: USER
//      *                 example: USER
//      *     responses:
//      *       201:
//      *         description: User created successfully
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
//      *                   example: User created successfully
//      *                 data:
//      *                   $ref: '#/components/schemas/UserPublic'
//      *       400:
//      *         description: Validation error
//      *       401:
//      *         description: Authentication required
//      *       403:
//      *         description: Admin access required
//      *       409:
//      *         description: User already exists
//      */
//     this.router.post(
//       '/',
//       this.authMiddleware.authenticate,
//       this.authMiddleware.authorize([UserRole.ADMIN]),
//       createUserValidation,
//       this.userController.createUser
//     );

//     /**
//      * @swagger
//      * /users:
//      *   get:
//      *     tags: [Users]
//      *     summary: Get all users
//      *     description: Get all users (Admin gets all users, regular users only see themselves)
//      *     security:
//      *       - bearerAuth: []
//      *       - cookieAuth: []
//      *     parameters:
//      *       - in: query
//      *         name: skip
//      *         schema:
//      *           type: integer
//      *           minimum: 0
//      *           default: 0
//      *         description: Number of users to skip for pagination
//      *       - in: query
//      *         name: take
//      *         schema:
//      *           type: integer
//      *           minimum: 1
//      *           maximum: 100
//      *           default: 10
//      *         description: Number of users to return
//      *     responses:
//      *       200:
//      *         description: Users retrieved successfully
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
//      *                   example: Users retrieved successfully
//      *                 data:
//      *                   type: array
//      *                   items:
//      *                     $ref: '#/components/schemas/UserPublic'
//      *                 pagination:
//      *                   type: object
//      *                   properties:
//      *                     skip:
//      *                       type: integer
//      *                     take:
//      *                       type: integer
//      *                     total:
//      *                       type: integer
//      *       401:
//      *         description: Authentication required
//      */
//     this.router.get('/', this.authMiddleware.authenticate, this.userController.getAllUsers);

//     /**
//      * @swagger
//      * /users/{id}:
//      *   get:
//      *     tags: [Users]
//      *     summary: Get user by ID
//      *     description: Get a specific user by ID (Admin can access any user, regular users only themselves)
//      *     security:
//      *       - bearerAuth: []
//      *       - cookieAuth: []
//      *     parameters:
//      *       - in: path
//      *         name: id
//      *         required: true
//      *         schema:
//      *           type: string
//      *         description: User ID
//      *     responses:
//      *       200:
//      *         description: User retrieved successfully
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
//      *                   example: User retrieved successfully
//      *                 data:
//      *                   $ref: '#/components/schemas/UserPublic'
//      *       401:
//      *         description: Authentication required
//      *       403:
//      *         description: Access denied
//      *       404:
//      *         description: User not found
//      */
//     this.router.get('/:id', this.authMiddleware.authenticate, this.userController.getUserById);

//     /**
//      * @swagger
//      * /users/{id}:
//      *   put:
//      *     tags: [Users]
//      *     summary: Update user
//      *     description: Update a user (Admin can update any user, regular users only themselves, only admins can change roles)
//      *     security:
//      *       - bearerAuth: []
//      *       - cookieAuth: []
//      *     parameters:
//      *       - in: path
//      *         name: id
//      *         required: true
//      *         schema:
//      *           type: string
//      *         description: User ID
//      *     requestBody:
//      *       required: true
//      *       content:
//      *         application/json:
//      *           schema:
//      *             type: object
//      *             properties:
//      *               email:
//      *                 type: string
//      *                 format: email
//      *                 example: updated@example.com
//      *               username:
//      *                 type: string
//      *                 minLength: 3
//      *                 maxLength: 30
//      *                 example: updateduser
//      *               password:
//      *                 type: string
//      *                 minLength: 6
//      *                 example: newpassword123
//      *               role:
//      *                 type: string
//      *                 enum: [USER, ADMIN]
//      *                 example: USER
//      *                 description: Only admins can change roles
//      *     responses:
//      *       200:
//      *         description: User updated successfully
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
//      *                   example: User updated successfully
//      *                 data:
//      *                   $ref: '#/components/schemas/UserPublic'
//      *       400:
//      *         description: Validation error
//      *       401:
//      *         description: Authentication required
//      *       403:
//      *         description: Access denied
//      *       404:
//      *         description: User not found
//      *       409:
//      *         description: Email or username already in use
//      */
//     this.router.put('/:id', this.authMiddleware.authenticate, updateUserValidation, this.userController.updateUser);

//     /**
//      * @swagger
//      * /users/{id}:
//      *   delete:
//      *     tags: [Users]
//      *     summary: Delete user (Admin only)
//      *     description: Delete a user. Only accessible by administrators. Admins cannot delete themselves.
//      *     security:
//      *       - bearerAuth: []
//      *       - cookieAuth: []
//      *     parameters:
//      *       - in: path
//      *         name: id
//      *         required: true
//      *         schema:
//      *           type: string
//      *         description: User ID
//      *     responses:
//      *       200:
//      *         description: User deleted successfully
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
//      *                   example: User deleted successfully
//      *       400:
//      *         description: Cannot delete your own account
//      *       401:
//      *         description: Authentication required
//      *       403:
//      *         description: Admin access required
//      *       404:
//      *         description: User not found
//      */
//     this.router.delete(
//       '/:id',
//       this.authMiddleware.authenticate,
//       this.authMiddleware.authorize([UserRole.ADMIN]),
//       this.userController.deleteUser
//     );
//   }
// }