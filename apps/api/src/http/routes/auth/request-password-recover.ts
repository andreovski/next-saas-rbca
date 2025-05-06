import { prisma } from '@/lib/prisma'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

const schema = {
  tags: ['auth'],
  summary: 'Request password recover',
  body: z.object({
    email: z.string().email(),
  }),
  response: {
    201: z.null(),
  },
}

export async function requestPasswordRecover(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .post('/password/recover', { schema }, async (req, reply) => {
      const { email } = req.body

      const userFromEmail = await prisma.user.findUnique({
        where: {
          email,
        },
      })

      if (!userFromEmail) {
        // We don't want people know if user really exists
        return reply.status(201).send()
      }

      const { id: code } = await prisma.token.create({
        data: {
          type: 'PASSWORD_RECOVER',
          userId: userFromEmail.id,
        },
      })

      // send link with password recover link
      console.log('recover password token: ', code)

      return reply.status(201).send()
    })
}
