import { prisma } from '@/lib/prisma'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { BadRequestError } from '../_errors/bad_request_error'
import { rolesSchema } from '@saas/auth'
import { auth } from '@/http/middlewares/auth'

const schema = {
  tags: ['invites'],
  summary: 'reject an invite',
  security: [{ bearerAuth: [] }],
  params: z.object({
    inviteId: z.string(),
  }),
  response: {
    204: z.null(),
  },
}

export async function rejectInvite(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post('/invites/:inviteId/reject', { schema }, async (req, reply) => {
      const userId = await req.getCurrentUserId()
      const { inviteId } = req.params

      const invite = await prisma.invite.findUnique({
        where: {
          id: inviteId,
        },
        include: {},
      })

      if (!invite) {
        throw new BadRequestError('Invite not found or expired')
      }

      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      })

      if (!user) {
        throw new BadRequestError('User not found')
      }

      if (invite.email !== user.email) {
        throw new BadRequestError('Invite email does not match user email')
      }

      await prisma.invite.delete({
        where: {
          id: inviteId,
        },
      })

      return reply.status(204).send()
    })
}
