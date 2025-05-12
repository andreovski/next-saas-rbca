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
  tags: ['members'],
  summary: 'Get members of a project',
  security: [{ bearerAuth: [] }],
  params: z.object({
    slug: z.string(),
  }),
  response: {
    200: z.object({
      members: z.array(
        z.object({
          id: z.string(),
          role: z.string(),
          userId: z.string(),
          name: z.string().nullable(),
          email: z.string().email(),
          avatarUrl: z.string().url().nullish(),
        })
      ),
    }),
  },
}

export async function getMembers(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .put('/organizations/:slug/members', { schema }, async (req, reply) => {
      const { slug } = req.params
      const { organization, membership } = await req.getUserMembership(slug)
      const userId = await req.getCurrentUserId()

      const { cannot } = getUserPermissions(userId, membership.role)

      if (cannot('get', 'User')) {
        throw new UnauthorizedError(
          'You are not allowed to see organization members'
        )
      }

      const members = await prisma.member.findMany({
        select: {
          id: true,
          role: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
        where: {
          organizationId: organization.id,
        },
        orderBy: {
          role: 'asc',
        },
      })

      const membersWithRole = members.map(
        ({ user: { id: userId, ...user }, ...member }) => {
          return {
            ...member,
            ...user,
            userId,
          }
        }
      )

      return { members: membersWithRole }
    })
}
