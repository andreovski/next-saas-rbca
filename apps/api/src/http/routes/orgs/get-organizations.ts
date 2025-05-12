import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { BadRequestError } from '../_errors/bad_request_error'
import { createSlug } from '@/utils/create-slug'
import { rolesSchema } from '@saas/auth'

const schema = {
  tags: ['organizations'],
  summary: 'Get organization where user is a member',
  security: [{ bearerAuth: [] }],
  params: z.object({
    slug: z.string(),
  }),
  response: {
    200: z.object({
      organizations: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          slug: z.string(),
          avatarUrl: z.string().nullish(),
          role: rolesSchema,
        })
      ),
    }),
  },
}

export async function getOrganizations(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get('/organizations', { schema }, async (req) => {
      const userId = await req.getCurrentUserId()

      const organizations = await prisma.organization.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          avatarUrl: true,
          members: {
            select: {
              role: true,
            },
            where: {
              userId,
            },
          },
        },
      })

      const organizationsWithRole = organizations.map(({ members, ...org }) => {
        return {
          ...org,
          role: members[0]?.role,
        }
      })

      return {
        organizations: organizationsWithRole,
      }
    })
}
