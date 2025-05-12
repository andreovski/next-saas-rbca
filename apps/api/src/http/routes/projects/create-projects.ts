import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { BadRequestError } from '../_errors/bad_request_error'
import { createSlug } from '@/utils/create-slug'
import { getUserPermissions } from '@/utils/get-user-permissions'
import { UnauthorizedError } from '../_errors/unauthorized-error'

const schema = {
  tags: ['projects'],
  summary: 'Create a new project',
  security: [{ bearerAuth: [] }],
  body: z.object({
    name: z.string(),
    description: z.string(),
  }),
  params: z.object({
    slug: z.string(),
  }),
  response: {
    201: z.object({
      projectId: z.string(),
    }),
  },
}

export async function createProject(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post('/organizations/:slug/projects', { schema }, async (req, reply) => {
      const userId = await req.getCurrentUserId()
      const { membership, organization } = await req.getUserMembership(userId)
      const { slug } = req.params

      const { name, description } = req.body

      const { cannot } = getUserPermissions(userId, membership.role)

      if (cannot('create', 'Project')) {
        throw new UnauthorizedError('You are not allowed to create a project')
      }

      const project = await prisma.project.create({
        data: {
          name,
          slug: createSlug(name),
          description,
          organizationId: organization.id,
          ownerId: userId,
        },
      })

      return reply.status(201).send({
        projectId: project.id,
      })
    })
}
