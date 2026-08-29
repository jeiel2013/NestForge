// nestforge:feature-file:rbac
import { Role } from './role.enum';
import { Permission } from './permissions';

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
    [Role.ADMIN]: Object.values(Permission),
    [Role.MANAGER]: [Permission.UserRead, Permission.UserUpdate, Permission.ReportRead],
    [Role.USER]: [Permission.UserRead],
};