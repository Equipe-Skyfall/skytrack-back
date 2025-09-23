// import swaggerJsdoc from 'swagger-jsdoc';

// // Define paths inline to ensure they're available in production
// const swaggerPaths = {
//   '/auth/login': {
//     post: {
//       tags: ['Authentication'],
//       summary: 'User login',
//       description: 'Authenticate user with email and password. Returns JWT token in response body and sets it as httpOnly cookie.',
//       requestBody: {
//         required: true,
//         content: {
//           'application/json': {
//             schema: {
//               type: 'object',
//               required: ['email', 'password'],
//               properties: {
//                 email: {
//                   type: 'string',
//                   format: 'email',
//                   example: 'admin@example.com'
//                 },
//                 password: {
//                   type: 'string',
//                   example: 'admin123'
//                 }
//               }
//             }
//           }
//         }
//       },
//       responses: {
//         200: {
//           description: 'Login successful',
//           headers: {
//             'Set-Cookie': {
//               description: 'JWT token set as httpOnly cookie',
//               schema: { type: 'string' }
//             }
//           },
//           content: {
//             'application/json': {
//               schema: {
//                 type: 'object',
//                 properties: {
//                   success: { type: 'boolean', example: true },
//                   message: { type: 'string', example: 'Login successful' },
//                   data: {
//                     type: 'object',
//                     properties: {
//                       token: { type: 'string', description: 'JWT token for authorization header' },
//                       expiresAt: { type: 'string', format: 'date-time' }
//                     }
//                   }
//                 }
//               }
//             }
//           }
//         },
//         401: { description: 'Invalid credentials' },
//         400: { description: 'Validation error' }
//       }
//     }
//   },
//   '/auth/logout': {
//     post: {
//       tags: ['Authentication'],
//       summary: 'User logout',
//       description: 'Clear JWT cookie and invalidate session',
//       security: [{ bearerAuth: [] }, { cookieAuth: [] }],
//       responses: {
//         200: {
//           description: 'Logout successful',
//           content: {
//             'application/json': {
//               schema: {
//                 type: 'object',
//                 properties: {
//                   success: { type: 'boolean', example: true },
//                   message: { type: 'string', example: 'Logout successful' }
//                 }
//               }
//             }
//           }
//         },
//         401: { description: 'Authentication required' }
//       }
//     }
//   },
//   '/auth/profile': {
//     get: {
//       tags: ['Authentication'],
//       summary: 'Get current user profile',
//       description: "Get authenticated user's profile information",
//       security: [{ bearerAuth: [] }, { cookieAuth: [] }],
//       responses: {
//         200: {
//           description: 'Profile retrieved successfully',
//           content: {
//             'application/json': {
//               schema: {
//                 type: 'object',
//                 properties: {
//                   success: { type: 'boolean', example: true },
//                   message: { type: 'string', example: 'Profile retrieved successfully' },
//                   data: { $ref: '#/components/schemas/AuthUser' }
//                 }
//               }
//             }
//           }
//         },
//         401: { description: 'Authentication required' }
//       }
//     }
//   },
//   '/users': {
//     post: {
//       tags: ['Users'],
//       summary: 'Create a new user (Admin only)',
//       description: 'Create a new user. Only accessible by administrators.',
//       security: [{ bearerAuth: [] }, { cookieAuth: [] }],
//       requestBody: {
//         required: true,
//         content: {
//           'application/json': {
//             schema: {
//               type: 'object',
//               required: ['email', 'username', 'password'],
//               properties: {
//                 email: { type: 'string', format: 'email', example: 'newuser@example.com' },
//                 username: { type: 'string', minLength: 3, maxLength: 30, example: 'newuser' },
//                 password: { type: 'string', minLength: 6, example: 'password123' },
//                 role: { type: 'string', enum: ['USER', 'ADMIN'], default: 'USER', example: 'USER' }
//               }
//             }
//           }
//         }
//       },
//       responses: {
//         201: {
//           description: 'User created successfully',
//           content: {
//             'application/json': {
//               schema: {
//                 type: 'object',
//                 properties: {
//                   success: { type: 'boolean', example: true },
//                   message: { type: 'string', example: 'User created successfully' },
//                   data: { $ref: '#/components/schemas/UserPublic' }
//                 }
//               }
//             }
//           }
//         },
//         400: { description: 'Validation error' },
//         401: { description: 'Authentication required' },
//         403: { description: 'Admin access required' },
//         409: { description: 'User already exists' }
//       }
//     },
//     get: {
//       tags: ['Users'],
//       summary: 'Get all users',
//       description: 'Get all users (Admin gets all users, regular users only see themselves)',
//       security: [{ bearerAuth: [] }, { cookieAuth: [] }],
//       parameters: [
//         {
//           in: 'query',
//           name: 'skip',
//           schema: { type: 'integer', minimum: 0, default: 0 },
//           description: 'Number of users to skip for pagination'
//         },
//         {
//           in: 'query',
//           name: 'take',
//           schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
//           description: 'Number of users to return'
//         }
//       ],
//       responses: {
//         200: {
//           description: 'Users retrieved successfully',
//           content: {
//             'application/json': {
//               schema: {
//                 type: 'object',
//                 properties: {
//                   success: { type: 'boolean', example: true },
//                   message: { type: 'string', example: 'Users retrieved successfully' },
//                   data: {
//                     type: 'array',
//                     items: { $ref: '#/components/schemas/UserPublic' }
//                   },
//                   pagination: {
//                     type: 'object',
//                     properties: {
//                       skip: { type: 'integer' },
//                       take: { type: 'integer' },
//                       total: { type: 'integer' }
//                     }
//                   }
//                 }
//               }
//             }
//           }
//         },
//         401: { description: 'Authentication required' }
//       }
//     }
//   },
//   '/users/{id}': {
//     get: {
//       tags: ['Users'],
//       summary: 'Get user by ID',
//       description: 'Get a specific user by ID (Admin can access any user, regular users only themselves)',
//       security: [{ bearerAuth: [] }, { cookieAuth: [] }],
//       parameters: [
//         {
//           in: 'path',
//           name: 'id',
//           required: true,
//           schema: { type: 'string' },
//           description: 'User ID'
//         }
//       ],
//       responses: {
//         200: {
//           description: 'User retrieved successfully',
//           content: {
//             'application/json': {
//               schema: {
//                 type: 'object',
//                 properties: {
//                   success: { type: 'boolean', example: true },
//                   message: { type: 'string', example: 'User retrieved successfully' },
//                   data: { $ref: '#/components/schemas/UserPublic' }
//                 }
//               }
//             }
//           }
//         },
//         401: { description: 'Authentication required' },
//         403: { description: 'Access denied' },
//         404: { description: 'User not found' }
//       }
//     },
//     put: {
//       tags: ['Users'],
//       summary: 'Update user',
//       description: 'Update a user (Admin can update any user, regular users only themselves, only admins can change roles)',
//       security: [{ bearerAuth: [] }, { cookieAuth: [] }],
//       parameters: [
//         {
//           in: 'path',
//           name: 'id',
//           required: true,
//           schema: { type: 'string' },
//           description: 'User ID'
//         }
//       ],
//       requestBody: {
//         required: true,
//         content: {
//           'application/json': {
//             schema: {
//               type: 'object',
//               properties: {
//                 email: { type: 'string', format: 'email', example: 'updated@example.com' },
//                 username: { type: 'string', minLength: 3, maxLength: 30, example: 'updateduser' },
//                 password: { type: 'string', minLength: 6, example: 'newpassword123' },
//                 role: { type: 'string', enum: ['USER', 'ADMIN'], example: 'USER', description: 'Only admins can change roles' }
//               }
//             }
//           }
//         }
//       },
//       responses: {
//         200: {
//           description: 'User updated successfully',
//           content: {
//             'application/json': {
//               schema: {
//                 type: 'object',
//                 properties: {
//                   success: { type: 'boolean', example: true },
//                   message: { type: 'string', example: 'User updated successfully' },
//                   data: { $ref: '#/components/schemas/UserPublic' }
//                 }
//               }
//             }
//           }
//         },
//         400: { description: 'Validation error' },
//         401: { description: 'Authentication required' },
//         403: { description: 'Access denied' },
//         404: { description: 'User not found' },
//         409: { description: 'Email or username already in use' }
//       }
//     },
//     delete: {
//       tags: ['Users'],
//       summary: 'Delete user (Admin only)',
//       description: 'Delete a user. Only accessible by administrators. Admins cannot delete themselves.',
//       security: [{ bearerAuth: [] }, { cookieAuth: [] }],
//       parameters: [
//         {
//           in: 'path',
//           name: 'id',
//           required: true,
//           schema: { type: 'string' },
//           description: 'User ID'
//         }
//       ],
//       responses: {
//         200: {
//           description: 'User deleted successfully',
//           content: {
//             'application/json': {
//               schema: {
//                 type: 'object',
//                 properties: {
//                   success: { type: 'boolean', example: true },
//                   message: { type: 'string', example: 'User deleted successfully' }
//                 }
//               }
//             }
//           }
//         },
//         400: { description: 'Cannot delete your own account' },
//         401: { description: 'Authentication required' },
//         403: { description: 'Admin access required' },
//         404: { description: 'User not found' }
//       }
//     }
//   }
// };

// const options = {
//   definition: {
//     openapi: '3.0.0',
//     info: {
//       title: 'User Authentication Microservice API',
//       version: '1.0.0',
//       description: 'A microservice for user CRUD operations and JWT authentication with dual auth support (cookies + headers)',
//       contact: {
//         name: 'API Support',
//         email: 'support@example.com'
//       }
//     },
//     servers: [
//       {
//         url: '/',
//         description: 'Current server'
//       }
//     ],
//     // Define paths inline
//     paths: swaggerPaths,
//     components: {
//       securitySchemes: {
//         bearerAuth: {
//           type: 'http',
//           scheme: 'bearer',
//           bearerFormat: 'JWT',
//           description: 'JWT token in Authorization header (Bearer <token>)'
//         },
//         cookieAuth: {
//           type: 'apiKey',
//           in: 'cookie',
//           name: 'token',
//           description: 'JWT token stored in httpOnly cookie'
//         }
//       },
//       schemas: {
//         UserPublic: {
//           type: 'object',
//           properties: {
//             id: { type: 'string', description: 'User unique identifier', example: 'clp1234567890abcdef' },
//             email: { type: 'string', format: 'email', description: 'User email address', example: 'user@example.com' },
//             username: { type: 'string', description: 'User username', example: 'johndoe' },
//             role: { type: 'string', enum: ['USER', 'ADMIN'], description: 'User role', example: 'USER' },
//             createdAt: { type: 'string', format: 'date-time', description: 'User creation timestamp', example: '2023-12-07T10:00:00.000Z' },
//             updatedAt: { type: 'string', format: 'date-time', description: 'User last update timestamp', example: '2023-12-07T10:00:00.000Z' }
//           }
//         },
//         AuthUser: {
//           type: 'object',
//           properties: {
//             id: { type: 'string', description: 'User unique identifier', example: 'clp1234567890abcdef' },
//             email: { type: 'string', format: 'email', description: 'User email address', example: 'user@example.com' },
//             username: { type: 'string', description: 'User username', example: 'johndoe' },
//             role: { type: 'string', enum: ['USER', 'ADMIN'], description: 'User role', example: 'USER' }
//           }
//         },
//         Error: {
//           type: 'object',
//           properties: {
//             success: { type: 'boolean', example: false },
//             message: { type: 'string', example: 'Error message' },
//             errors: {
//               type: 'array',
//               items: {
//                 type: 'object',
//                 properties: {
//                   field: { type: 'string', example: 'email' },
//                   message: { type: 'string', example: 'Please provide a valid email' }
//                 }
//               }
//             }
//           }
//         }
//       }
//     },
//     tags: [
//       { name: 'Authentication', description: 'Authentication endpoints' },
//       { name: 'Users', description: 'User CRUD operations' }
//     ]
//   },
//   apis: [] // No need for external files since we define everything inline
// };

// export const swaggerSpec = swaggerJsdoc(options);