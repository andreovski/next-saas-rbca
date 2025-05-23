import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { BadRequestError } from '../_errors/bad_request_error'
import { createSlug } from '@/utils/create-slug'

const schema = {
  tags: ['organizations'],
  summary: 'Create a new organization',
  security: [{ bearerAuth: [] }],
  body: z.object({
    name: z.string(),
    domain: z.string().nullish(),
    shouldAttachUsersByDomain: z.boolean().optional(),
  }),
  response: {
    201: z.object({
      organizationId: z.string(),
    }),
  },
}

export async function createOrganization(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post('/organizations', { schema }, async (req, reply) => {
      const userId = await req.getCurrentUserId()
      const { name, domain, shouldAttachUsersByDomain } = req.body

      if (domain) {
        const organizationByDomain = await prisma.organization.findUnique({
          where: { domain },
        })

        if (organizationByDomain) {
          throw new BadRequestError('Domain already in use')
        }
      }

      const organization = await prisma.organization.create({
        data: {
          name,
          slug: createSlug(name),
          domain,
          shouldAttachUsersByDomain,
          ownerId: userId,
          members: {
            create: {
              userId,
              role: 'ADMIN',
            },
          },
        },
      })

      return reply.status(201).send({
        organizationId: organization.id,
      })
    })
}
