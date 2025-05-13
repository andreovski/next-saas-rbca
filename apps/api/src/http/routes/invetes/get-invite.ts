import { prisma } from '@/lib/prisma'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { BadRequestError } from '../_errors/bad_request_error'
import { rolesSchema } from '@saas/auth'

const schema = {
  tags: ['invites'],
  summary: 'Get an invite',
  security: [{ bearerAuth: [] }],
  params: z.object({
    inviteId: z.string(),
  }),
  response: {
    201: z.object({
      invite: z.object({
        id: z.string(),
        email: z.string().email(),
        role: rolesSchema,
        createdAt: z.date(),
        organization: z.object({
          name: z.string(),
        }),
        author: z
          .object({
            id: z.string(),
            name: z.string().nullable(),
            avatarUrl: z.string().nullable(),
          })
          .nullable(),
      }),
    }),
  },
}

export async function getInvite(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .get('/invites/:inviteId', { schema }, async (req, reply) => {
      const { inviteId } = req.params

      const invite = await prisma.invite.findUnique({
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
          author: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
          organization: {
            select: {
              name: true,
            },
          },
        },
        where: {
          id: inviteId,
        },
      })

      if (!invite) {
        throw new BadRequestError('Invite not found')
      }

      return { invite }
    })
}
