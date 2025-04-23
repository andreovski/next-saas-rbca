import { z } from 'zod'

export const rolesSchema = z.enum(['ADMIN', 'MEMBER', 'BILING'])

export type Roles = z.infer<typeof rolesSchema>
