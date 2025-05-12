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
  summary: 'Delete an existing project',
  security: [{ bearerAuth: [] }],
  params: z.object({
    projectId: z.string(),
    slug: z.string(),
  }),
  response: {
    204: z.null(),
  },
}

export async function deleteProject(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .delete(
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

        if (cannot('delete', authProject)) {
          throw new UnauthorizedError(
            'You are not allowed to delete this organization'
          )
        }

        await prisma.project.delete({
          where: {
            id: project.id,
          },
        })

        return reply.status(204).send()
      }
    )
}
