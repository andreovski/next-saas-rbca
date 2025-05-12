import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { BadRequestError } from '../_errors/bad_request_error'
import { createSlug } from '@/utils/create-slug'

const schema = {
  tags: ['organizations'],
  summary: 'Get details of an organization',
  security: [{ bearerAuth: [] }],
  params: z.object({
    slug: z.string(),
  }),
  response: {
    200: z.object({
      organization: z.object({
        id: z.string(),
        name: z.string(),
        slug: z.string(),
        domain: z.string().nullish(),
        shouldAttachUsersByDomain: z.boolean().optional(),
        avatarUrl: z.string().nullish(),
        createdAt: z.date(),
        updatedAt: z.date(),
      }),
    }),
  },
}

export async function getOrganization(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get('/organizations/:slug', { schema }, async (req, reply) => {
      const { slug } = req.params
      const { organization } = await req.getUserMembership(slug)

      return {
        organization,
      }
    })
}
