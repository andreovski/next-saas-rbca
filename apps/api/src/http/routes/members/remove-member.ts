import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { getUserPermissions } from '@/utils/get-user-permissions'
import { UnauthorizedError } from '../_errors/unauthorized-error'
import { rolesSchema } from '@saas/auth'

const schema = {
  tags: ['members'],
  summary: 'Remove a members of a organization',
  security: [{ bearerAuth: [] }],
  params: z.object({
    memberId: z.string(),
    slug: z.string(),
  }),
  response: {
    204: z.null(),
  },
}

export async function removeMember(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .delete(
      '/organizations/:slug/members/:memberId',
      { schema },
      async (req, reply) => {
        const { slug, memberId } = req.params
        const { organization, membership } = await req.getUserMembership(slug)
        const userId = await req.getCurrentUserId()

        const { cannot } = getUserPermissions(userId, membership.role)

        if (cannot('delete', 'User')) {
          throw new UnauthorizedError(
            'You are not allowed to remove this member from the organization'
          )
        }

        const member = await prisma.member.delete({
          where: {
            id: memberId,
            organizationId: organization.id,
          },
        })

        return reply.status(204).send()
      }
    )
}
