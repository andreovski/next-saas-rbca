import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { BadRequestError } from '../_errors/bad_request_error'
import { createSlug } from '@/utils/create-slug'
import { getUserPermissions } from '@/utils/get-user-permissions'
import { UnauthorizedError } from '../_errors/unauthorized-error'
import { rolesSchema } from '@saas/auth'

const schema = {
  tags: ['members'],
  summary: 'Get members of a project',
  security: [{ bearerAuth: [] }],
  params: z.object({
    memberId: z.string(),
    slug: z.string(),
  }),
  body: z.object({
    role: rolesSchema,
  }),
  response: {
    204: z.null(),
  },
}

export async function updateMember(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .put(
      '/organizations/:slug/members/:memberId',
      { schema },
      async (req, reply) => {
        const { slug, memberId } = req.params
        const { organization, membership } = await req.getUserMembership(slug)
        const userId = await req.getCurrentUserId()

        const { cannot } = getUserPermissions(userId, membership.role)

        if (cannot('update', 'User')) {
          throw new UnauthorizedError(
            'You are not allowed to update this member'
          )
        }

        const { role } = req.body

        const member = await prisma.member.update({
          where: {
            id: memberId,
            organizationId: organization.id,
          },
          data: {
            role,
          },
        })

        return reply.status(204).send()
      }
    )
}
