import { fastify } from 'fastify'
import fastifyCors from '@fastify/cors'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { createAccount } from './routes/auth/create-account'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import { authenticateWithPassword } from './routes/auth/authenticate-with-password'
import fastifyJwt from '@fastify/jwt'
import { getProfile } from './routes/auth/get-profile'
import { errorHandler } from './error-handler'
import { requestPasswordRecover } from './routes/auth/request-password-recover'
import { resetPassword } from './routes/auth/reset-password'
import { authenticateWithGithub } from './routes/auth/authenticate-with-github'
import { env } from '@saas/env'
import { createOrganization } from './routes/orgs/create-organization'
import { getMembership } from './routes/orgs/get-membership'
import { getOrganization } from './routes/orgs/get-organization'
import { getOrganizations } from './routes/orgs/get-organizations'
import { updateOrganization } from './routes/orgs/update-organization'
import { shutdownOrganization } from './routes/orgs/shutdown-organization'
import { transferOrganization } from './routes/orgs/transfer-organization'
import { createProject } from './routes/projects/create-projects'
import { deleteProject } from './routes/projects/delete-project'
import { getProject } from './routes/projects/get-project'
import { getProjects } from './routes/projects/get-projects'
import { updateProject } from './routes/projects/update-project'
import { getMembers } from './routes/members/get-members'
import { updateMember } from './routes/members/update-members'
import { removeMember } from './routes/members/remove-member'
import { createInvite } from './routes/invetes/create-invite'
import { getInvite } from './routes/invetes/get-invite'
import { getInvites } from './routes/invetes/get-invites'
import { acceptInvite } from './routes/invetes/accept-invite'
import { rejectInvite } from './routes/invetes/reject-invite'
import { revokeInvite } from './routes/invetes/revoke-invite'
import { getPendingInvites } from './routes/invetes/get-pending-invites'
import { getOrganizationBilling } from './routes/billing/get-organization-billing'

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)
app.setErrorHandler(errorHandler)

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Next.js SaaS',
      description: 'App Full Stack with multi-tenant & RBAC',
      version: '1.0.0',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  transform: jsonSchemaTransform,
})
app.register(fastifySwaggerUi, {
  routePrefix: '/docs',
})
app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
})

app.register(fastifyCors)
app.register(getProfile)
app.register(createAccount)
app.register(authenticateWithPassword)
app.register(requestPasswordRecover)
app.register(resetPassword)
app.register(authenticateWithGithub)

app.register(getOrganizations)
app.register(getOrganization)
app.register(getMembership)
app.register(createOrganization)
app.register(updateOrganization)
app.register(shutdownOrganization)
app.register(transferOrganization)

app.register(getProject)
app.register(getProjects)
app.register(createProject)
app.register(updateProject)
app.register(deleteProject)

app.register(getMembers)
app.register(updateMember)
app.register(removeMember)

app.register(getInvite)
app.register(getInvites)
app.register(createInvite)
app.register(acceptInvite)
app.register(rejectInvite)
app.register(revokeInvite)
app.register(getPendingInvites)

app.register(getOrganizationBilling)

app.listen({ port: env.SERVER_PORT }).then(() => {
  console.log(`Server is running on http://localhost:${env.SERVER_PORT}`)
})
