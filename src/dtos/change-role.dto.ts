import { z } from 'zod';
import { Role } from '../constants/roles';

export const ChangeRoleSchema = z.object({
  role: z.nativeEnum(Role)
});

export type ChangeRoleDto = z.infer<typeof ChangeRoleSchema>;