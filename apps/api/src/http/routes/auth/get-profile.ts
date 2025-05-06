import { prisma } from '@/lib/prisma'
import { compare } from 'bcryptjs'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { BadRequestError } from '../_errors/bad_request_error'
import { auth } from '@/http/middlewares/auth'

const schema = {
  tags: ['auth'],
  summary: 'Get authenticated user profile',
  secutiry: [{ bearerAuth: [] }],
  response: {
    200: z.object({
      user: z.object({
        id: z.string(),
        name: z.string().nullable(),
        email: z.string(),
        avatarUrl: z.string().nullable(),
      }),
    }),
  },
}

export async function getProfile(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get('/profile', { schema }, async (req, reply) => {
      const userId = await req.getCurrentUserId()

      const user = await prisma.user.findUnique({
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
        where: {
          id: userId,
        },
      })

      if (!user) {
        throw new BadRequestError('User not found!')
      }

      return reply.send({ user })
    })
}
