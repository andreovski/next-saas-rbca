import { z } from 'zod'

export const rolesSchema = z.enum(['ADMIN', 'MEMBER', 'BILLING'])

export type Roles = z.infer<typeof rolesSchema>
