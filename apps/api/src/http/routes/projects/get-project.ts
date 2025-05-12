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
  summary: 'Get details of an project',
  security: [{ bearerAuth: [] }],
  params: z.object({
    orgSlug: z.string(),
    projectSlug: z.string(),
  }),
  response: {
    200: z.object({
      project: z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        slug: z.string(),
        ownerId: z.string(),
        avatarUrl: z.string().nullish(),
        organizationId: z.string(),
        owner: z.object({
          id: z.string(),
          name: z.string().nullable(),
          avatarUrl: z.string().nullish(),
        }),
      }),
    }),
  },
}

export async function getProject(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get(
      '/organizations/:orgSlug/projects/:projectSlug',
      { schema },
      async (req, reply) => {
        const { projectSlug, orgSlug } = req.params
        const { organization, membership } =
          await req.getUserMembership(orgSlug)
        const userId = await req.getCurrentUserId()

        const { cannot } = getUserPermissions(userId, membership.role)

        if (cannot('get', 'Project')) {
          throw new UnauthorizedError('You are not allowed to see this project')
        }

        const project = await prisma.project.findUnique({
          select: {
            id: true,
            name: true,
            description: true,
            slug: true,
            ownerId: true,
            avatarUrl: true,
            organizationId: true,
            owner: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
          where: {
            slug: projectSlug,
            organizationId: organization.id,
          },
        })

        if (!project) {
          throw new BadRequestError('Project not found')
        }

        return { project }
      }
    )
}
