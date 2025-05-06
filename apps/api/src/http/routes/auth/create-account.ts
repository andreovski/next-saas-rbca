import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { BadRequestError } from '../_errors/bad_request_error'

const schema = {
  tags: ['auth'],
  summary: 'Create a new account',
  body: z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(8),
  }),
}

export async function createAccount(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .post('/users', { schema }, async (req, reply) => {
      const { name, email, password } = req.body

      const userWithSameEmail = await prisma.user.findUnique({
        where: { email },
      })

      if (userWithSameEmail) {
        throw new BadRequestError('user with same e-mail already exists')
      }

      const passwordHash = await hash(password, 6)

      const [, domain] = email.split('@')

      const autoJoinOrganization = await prisma.organization.findFirst({
        where: {
          domain,
          shouldAttachUsersByDomain: true,
        },
      })

      await prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
          member_on: autoJoinOrganization
            ? {
                create: {
                  organizationId: autoJoinOrganization.id,
                },
              }
            : undefined,
        },
      })

      reply.status(201).send()
    })
}
