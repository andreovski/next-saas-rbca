import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { BadRequestError } from '../_errors/bad_request_error'
import { organizationSchema } from '@saas/auth'
import { UnauthorizedError } from '../_errors/unauthorized-error'
import { getUserPermissions } from '@/utils/get-user-permissions'

const schema = {
  tags: ['organizations'],
  summary: 'Transfer ownership of an organization',
  security: [{ bearerAuth: [] }],
  body: z.object({
    transferToUserId: z.string(),
  }),
  params: z.object({
    slug: z.string(),
  }),
  response: {
    204: z.null(),
  },
}

export async function transferOrganization(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .put('/organizations/:slug/owner', { schema }, async (req, reply) => {
      const { slug } = req.params

      const userId = await req.getCurrentUserId()
      const { organization, membership } = await req.getUserMembership(slug)

      const authOrganization = organizationSchema.parse(organization)

      const { cannot } = getUserPermissions(userId, membership.role)

      if (cannot('transfer_ownership', authOrganization)) {
        throw new UnauthorizedError(
          'You are not allowed to update this organization'
        )
      }

      const { transferToUserId } = req.body

      const transferToMembership = await prisma.member.findFirst({
        where: {
          userId: transferToUserId,
          organizationId: authOrganization.id,
        },
      })

      if (!transferToMembership) {
        throw new BadRequestError('User is not a member of this organization')
      }

      await prisma.$transaction([
        prisma.member.update({
          where: {
            organizationId_userId: {
              organizationId: authOrganization.id,
              userId: userId,
            },
          },
          data: {
            role: 'ADMIN',
          },
        }),
        prisma.organization.update({
          where: { id: organization.id },
          data: { ownerId: transferToUserId },
        }),
      ])

      return reply.status(204).send()
    })
}
