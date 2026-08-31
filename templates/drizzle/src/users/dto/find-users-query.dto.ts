import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';
import { Role } from '../../common/constants/role.enum';

export const findUsersQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1).describe('Página atual'),
    limit: z.coerce.number().int().min(1).max(100).default(10).describe('Itens por página (máx. 100)'),
    search: z.string().optional().describe('Busca por nome ou e-mail'),
    role: z.nativeEnum(Role).optional().describe('Filtra por role'),
});

export class FindUsersQueryDto extends createZodDto(findUsersQuerySchema) { }