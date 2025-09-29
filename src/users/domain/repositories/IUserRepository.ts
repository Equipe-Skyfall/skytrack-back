// import { User, CreateUserData, UpdateUserData } from '../entities/User';

// export interface IUserRepository {
//   create(userData: CreateUserData): Promise<User>;
//   findById(id: string): Promise<User | null>;
//   findByEmail(email: string): Promise<User | null>;
//   findByUsername(username: string): Promise<User | null>;
//   findAll(skip?: number, take?: number): Promise<User[]>;
//   update(id: string, userData: UpdateUserData): Promise<User>;
//   delete(id: string): Promise<void>;
//   exists(email: string, username: string): Promise<boolean>;
//   count(): Promise<number>;
// }