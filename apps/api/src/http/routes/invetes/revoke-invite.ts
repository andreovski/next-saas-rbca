import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { BadRequestError } from '../_errors/bad_request_error'
import { getUserPermissions } from '@/utils/get-user-permissions'
import { UnauthorizedError } from '../_errors/unauthorized-error'
import { rolesSchema } from '@saas/auth'

const schema = {
  tags: ['invites'],
  summary: 'Revoke an invite',
  security: [{ bearerAuth: [] }],
  params: z.object({
    slug: z.string(),
    inviteId: z.string(),
  }),
  response: {
    201: z.null(),
  },
}

export async function revokeInvite(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post(
      '/organizations/:slug/invites/:inviteId',
      { schema },
      async (req, reply) => {
        const userId = await req.getCurrentUserId()
        const { slug, inviteId } = req.params
        const { membership, organization } = await req.getUserMembership(slug)

        const { cannot } = getUserPermissions(userId, membership.role)

        if (cannot('delete', 'Invite')) {
          throw new UnauthorizedError('You are not allowed to delete an invite')
        }

        const invite = await prisma.invite.findUnique({
          where: {
            id: inviteId,
            organizationId: organization.id,
          },
        })

        if (!invite) {
          throw new BadRequestError('Invite not found')
        }

        await prisma.invite.delete({
          where: {
            id: inviteId,
          },
        })

        return reply.status(204).send()
      }
    )
}
