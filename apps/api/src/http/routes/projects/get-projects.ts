import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { getUserPermissions } from '@/utils/get-user-permissions'
import { UnauthorizedError } from '../_errors/unauthorized-error'

const schema = {
  tags: ['projects'],
  summary: 'Get all projects of an organization',
  security: [{ bearerAuth: [] }],
  params: z.object({
    slug: z.string(),
  }),
  response: {
    200: z.object({
      projects: z.array(
        z.object({
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
        })
      ),
    }),
  },
}

export async function getProjects(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get('/organizations/:slug/projects', { schema }, async (req, reply) => {
      const { slug } = req.params
      const { organization, membership } = await req.getUserMembership(slug)
      const userId = await req.getCurrentUserId()

      const { cannot } = getUserPermissions(userId, membership.role)

      if (cannot('get', 'Project')) {
        throw new UnauthorizedError('You are not allowed to see this project')
      }

      const projects = await prisma.project.findMany({
        select: {
          id: true,
          name: true,
          description: true,
          slug: true,
          ownerId: true,
          avatarUrl: true,
          organizationId: true,
          createdAt: true,
          owner: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
        where: {
          organizationId: organization.id,
        },
        orderBy: {
          createdAt: 'desc',
        },
      })

      return { projects }
    })
}
