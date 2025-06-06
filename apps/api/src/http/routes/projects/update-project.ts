import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { organizationSchema, projectSchema } from '@saas/auth'
import { UnauthorizedError } from '../_errors/unauthorized-error'
import { getUserPermissions } from '@/utils/get-user-permissions'
import { BadRequestError } from '../_errors/bad_request_error'

const schema = {
  tags: ['projects'],
  summary: 'Update an existing project',
  security: [{ bearerAuth: [] }],
  params: z.object({
    projectId: z.string(),
    slug: z.string(),
  }),
  body: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
  }),
  response: {
    204: z.null(),
  },
}

export async function updateProject(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .put(
      '/organizations/:slug/projects/:projectId',
      { schema },
      async (req, reply) => {
        const { slug } = req.params

        const userId = await req.getCurrentUserId()
        const { organization, membership } = await req.getUserMembership(slug)

        const project = await prisma.project.findUnique({
          where: {
            id: req.params.projectId,
            organizationId: organization.id,
          },
        })

        if (!project) {
          throw new BadRequestError('Project not found')
        }

        const authProject = projectSchema.parse(project)
        const { cannot } = getUserPermissions(userId, membership.role)

        if (cannot('update', authProject)) {
          throw new UnauthorizedError(
            'You are not allowed to update this organization'
          )
        }

        const { name, description } = req.body

        await prisma.project.update({
          where: {
            id: project.id,
          },
          data: {
            name,
            description,
          },
        })

        return reply.status(204).send()
      }
    )
}
