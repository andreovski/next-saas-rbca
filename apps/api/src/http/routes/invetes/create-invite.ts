import { auth } from '@/http/middlewares/auth'
import { prisma } from '@/lib/prisma'
import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { BadRequestError } from '../_errors/bad_request_error'
import { getUserPermissions } from '@/utils/get-user-permissions'
import { UnauthorizedError } from '../_errors/unauthorized-error'
import { rolesSchema } from '@saas/auth'

const schema = {
  tags: ['invites'],
  summary: 'Create a new invite',
  security: [{ bearerAuth: [] }],
  body: z.object({
    email: z.string().email(),
    role: rolesSchema,
  }),
  params: z.object({
    slug: z.string(),
  }),
  response: {
    201: z.object({
      inviteId: z.string(),
    }),
  },
}

export async function createInvite(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .post('/organizations/:slug/invites', { schema }, async (req, reply) => {
      const userId = await req.getCurrentUserId()
      const { slug } = req.params
      const { membership, organization } = await req.getUserMembership(slug)

      const { email, role } = req.body

      const { cannot } = getUserPermissions(userId, membership.role)

      if (cannot('create', 'Invite')) {
        throw new UnauthorizedError('You are not allowed to create a invite')
      }

      const [, domain] = email.split('@')

      if (
        organization.shouldAttachUsersByDomain &&
        organization.domain === domain
      ) {
        throw new BadRequestError(
          `Users with ${domain} domain are already attached to the organization`
        )
      }

      const inviteWithSameEmail = await prisma.invite.findUnique({
        where: {
          email_organizationId: {
            email,
            organizationId: organization.id,
          },
        },
      })

      if (inviteWithSameEmail) {
        throw new BadRequestError(`Invite with email ${email} already exists`)
      }

      const memberWithSameEmail = await prisma.member.findFirst({
        where: {
          organizationId: organization.id,
          user: {
            email,
          },
        },
      })

      if (memberWithSameEmail) {
        throw new BadRequestError(
          `Member with email ${email} already belongs to the organization`
        )
      }

      const invite = await prisma.invite.create({
        data: {
          email,
          role,
          organizationId: organization.id,
          authorId: userId,
        },
      })

      return reply.status(201).send({
        inviteId: invite.id,
      })
    })
}
