import { z } from 'zod'
import { projectSchema } from '../models/project'

export const projectSubject = z.tuple([
  z.enum(['manage', 'create', 'delete', 'get', 'update']),
  z.union([z.literal('Project'), projectSchema]),
])

export type ProjectSubject = z.infer<typeof projectSubject>
