import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { BadRequestError } from '../_errors/bad_request_error'
import { createSlug } from '@/utils/create-slug'
import { getUserPermissions } from '@/utils/get-user-permissions'

const schema = {
  tags: ['billing'],
  summary: 'Get billing information for an organization',
  security: [{ bearerAuth: [] }],
  params: z.object({
    slug: z.string(),
  }),
  response: {
    200: z.object({
      billint: z.object({
        seats: z.object({
          amount: z.number(),
          unit: z.number(),
          price: z.number(),
        }),
        projects: z.object({
          amount: z.number(),
          unit: z.number(),
          price: z.number(),
        }),
        total: z.number(),
      }),
    }),
  },
}

export async function getOrganizationBilling(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .get('/organizations/:slug/billing', { schema }, async (req) => {
      const { slug } = req.params
      const userId = await req.getCurrentUserId()
      const { organization, membership } = await req.getUserMembership(slug)

      const { cannot } = getUserPermissions(userId, membership.role)

      if (cannot('get', 'Billing')) {
        throw new BadRequestError(
          'You are not allowed to get billing information'
        )
      }

      const [amountOfMembers, amountOfProjects] = await Promise.all([
        prisma.member.count({
          where: {
            organizationId: organization.id,
            role: { not: 'BILLING' },
          },
        }),
        prisma.project.count({
          where: {
            organizationId: organization.id,
          },
        }),
      ])

      return {
        billint: {
          seats: {
            amount: amountOfMembers,
            unit: 10,
            price: amountOfMembers * 10,
          },
          projects: {
            amount: amountOfProjects,
            unit: 20,
            price: amountOfProjects * 20,
          },
          total: amountOfMembers * 10 + amountOfProjects * 20,
        },
      }
    })
}
