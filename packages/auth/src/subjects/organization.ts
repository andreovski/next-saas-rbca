import { z } from 'zod'
import { organizationSchema } from '../models/organization'

export const organizationSubject = z.tuple([
  z.enum(['manage', 'delete', 'update', 'transfer_ownership']),
  z.union([z.literal('Organization'), organizationSchema]),
])

export type OrganizationSubject = z.infer<typeof organizationSubject>
