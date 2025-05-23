import { prisma } from '@/lib/prisma'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { BadRequestError } from '../_errors/bad_request_error'
import { rolesSchema } from '@saas/auth'
import { auth } from '@/http/middlewares/auth'

const schema = {
  tags: ['invites'],
  summary: 'Get all user pending invites',
  security: [{ bearerAuth: [] }],
  response: {
    201: z.object({
      invites: z.array(
        z.object({
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
        })
      ),
    }),
  },
}

export async function getPendingInvites(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post('/pending-invites', { schema }, async (req) => {
      const userId = await req.getCurrentUserId()

      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      })

      if (!user) {
        throw new BadRequestError('User not found')
      }

      const invites = await prisma.invite.findMany({
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
          email: user.email,
        },
      })

      return { invites }
    })
}
