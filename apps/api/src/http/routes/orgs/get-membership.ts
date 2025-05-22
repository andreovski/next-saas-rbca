import { auth } from "@/http/middlewares/auth";
import { rolesSchema } from '@saas/auth'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'

const schema = {
  tags: ['organizations'],
  summary: 'Get membership of an organization',
  security: [{ bearerAuth: [] }],
  params: z.object({
    slug: z.string(),
  }),
  response: {
    200: z.object({
      membership: z.object({
        id: z.string(),
        role: rolesSchema,
        userId: z.string(),
        organizationId: z.string(),
      }),
    }),
  },
}

export async function getMembership(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get('/organization/:slug/membership', { schema }, async (req) => {
      const { slug } = req.params
      const { membership } = await req.getUserMembership(slug)

      return {
        membership: {
          id: membership.id,
          role: rolesSchema.parse(membership.role),
          userId: membership.userId,
          organizationId: membership.organizationId,
        },
      }
    })
}