import { SetMetadata } from '@nestjs/common';
import { Permission } from 'src/decorators/role.dto';

export const PERMISSIONS_KEY = 'permissions';

export const Permissions = (permission: Permission | Permission[]) => {
  const normalizedPermissions = Array.isArray(permission)
    ? permission
    : [permission];

  return SetMetadata(PERMISSIONS_KEY, normalizedPermissions);
};
