import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { BadRequestError } from '../_errors/bad_request_error'
import { createSlug } from '@/utils/create-slug'
import { defineAbilityFor, organizationSchema, userSchema } from '@saas/auth'
import { UnauthorizedError } from '../_errors/unauthorized-error'
import { getUserPermissions } from '@/utils/get-user-permissions'

const schema = {
  tags: ['organizations'],
  summary: 'Update an existing organization',
  security: [{ bearerAuth: [] }],
  body: z.object({
    name: z.string(),
    domain: z.string().nullish(),
    shouldAttachUsersByDomain: z.boolean().optional(),
  }),
  params: z.object({
    slug: z.string(),
  }),
  response: {
    204: z.null(),
  },
}

export async function updateOrganization(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .put('/organizations/:slug', { schema }, async (req, reply) => {
      const { slug } = req.params
      const { name, domain, shouldAttachUsersByDomain } = req.body

      const userId = await req.getCurrentUserId()
      const { organization, membership } = await req.getUserMembership(slug)

      const authOrganization = organizationSchema.parse(organization)

      const { cannot } = getUserPermissions(userId, membership.role)

      if (cannot('update', authOrganization)) {
        throw new UnauthorizedError(
          'You are not allowed to update this organization'
        )
      }

      if (domain) {
        const organizationByDomain = await prisma.organization.findFirst({
          where: { domain, slug: { not: slug } },
        })

        if (organizationByDomain) {
          throw new BadRequestError('Domain already in use')
        }
      }

      await prisma.organization.update({
        where: {
          id: organization.id,
        },
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

      return reply.status(204).send()
    })
}
