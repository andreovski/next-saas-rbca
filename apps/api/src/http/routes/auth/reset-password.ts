import { prisma } from '@/lib/prisma'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { UnauthorizedError } from '../_errors/unauthorized-error'
import { hash } from 'bcryptjs'

const schema = {
  tags: ['auth'],
  summary: 'Reset password',
  body: z.object({
    code: z.string(),
    password: z.string().min(8),
  }),
  response: {
    204: z.null(),
  },
}

export async function resetPassword(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .post('/password/reset', { schema }, async (req, reply) => {
      const { code, password } = req.body

      const tokenFromCode = await prisma.token.findUnique({
        where: { id: code },
      })

      if (!tokenFromCode) {
        throw new UnauthorizedError()
      }

      const passwordHash = await hash(password, 6)

      prisma.$transaction([
        prisma.user.update({
          where: {
            id: tokenFromCode.userId,
          },
          data: {
            passwordHash,
          },
        }),
        prisma.token.delete({
          where: {
            id: tokenFromCode.id,
          },
        }),
      ])



      return reply.status(204).send()
    })
}
