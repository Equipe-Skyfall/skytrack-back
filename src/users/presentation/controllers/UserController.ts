// import { Request, Response, NextFunction } from 'express';
// import { UserUseCase } from '../../application/useCases/UserUseCase';
// import { CreateUserData, UpdateUserData } from '../../domain/entities/User';

// export class UserController {
//   constructor(private userUseCase: UserUseCase) {}

//   createUser = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const userData: CreateUserData = req.body;
//       const user = await this.userUseCase.createUser(userData, req.user);

//       res.status(201).json({
//         success: true,
//         message: 'User created successfully',
//         data: user
//       });
//     } catch (error) {
//       next(error);
//     }
//   };

//   getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const skip = parseInt(req.query.skip as string) || 0;
//       const take = parseInt(req.query.take as string) || 10;

//       const users = await this.userUseCase.getAllUsers(req.user!, skip, take);

//       res.status(200).json({
//         success: true,
//         message: 'Users retrieved successfully',
//         data: users,
//         pagination: {
//           skip,
//           take,
//           total: users.length
//         }
//       });
//     } catch (error) {
//       next(error);
//     }
//   };

//   getUserById = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const { id } = req.params;
//       const user = await this.userUseCase.getUserById(id, req.user!);

//       res.status(200).json({
//         success: true,
//         message: 'User retrieved successfully',
//         data: user
//       });
//     } catch (error) {
//       next(error);
//     }
//   };

//   updateUser = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const { id } = req.params;
//       const userData: UpdateUserData = req.body;
//       const user = await this.userUseCase.updateUser(id, userData, req.user!);

//       res.status(200).json({
//         success: true,
//         message: 'User updated successfully',
//         data: user
//       });
//     } catch (error) {
//       next(error);
//     }
//   };

//   deleteUser = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const { id } = req.params;
//       await this.userUseCase.deleteUser(id, req.user!);

//       res.status(200).json({
//         success: true,
//         message: 'User deleted successfully'
//       });
//     } catch (error) {
//       next(error);
//     }
//   };
// }