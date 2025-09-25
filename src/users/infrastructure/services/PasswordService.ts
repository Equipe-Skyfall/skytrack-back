// import bcrypt from 'bcryptjs';
// import { IPasswordService } from '../../domain/services/IPasswordService';

// export class PasswordService implements IPasswordService {
//   private readonly saltRounds: number;

//   constructor(saltRounds = 12) {
//     this.saltRounds = saltRounds;
//   }

//   async hash(password: string): Promise<string> {
//     return await bcrypt.hash(password, this.saltRounds);
//   }

//   async compare(password: string, hashedPassword: string): Promise<boolean> {
//     return await bcrypt.compare(password, hashedPassword);
//   }
// }