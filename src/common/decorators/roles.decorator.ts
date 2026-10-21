import { SetMetadata } from '@nestjs/common';
import { UserRoleEnum } from '../enums/user.enum';

export const KEY_ROLE = 'KEY_ROLE';

export const Roles = (...roles: UserRoleEnum[]) => SetMetadata(KEY_ROLE, roles);
