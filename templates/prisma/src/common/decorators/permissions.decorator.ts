// nestforge:feature-file:rbac
import { SetMetadata } from '@nestjs/common';
import { Permission } from '../constants/permissions';

export const PERMISSIONS_KEY = 'permissions';
export const Permissions = (...permissions: Permission[]) =>
    SetMetadata(PERMISSIONS_KEY, permissions);