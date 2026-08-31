import { createZodDto } from 'nestjs-zod';
import { createUserSchema } from './create-user.dto';

export const updateUserSchema = createUserSchema.partial();

export class UpdateUserDto extends createZodDto(updateUserSchema) { }