import { api } from './api-client'
import { Roles } from '@saas/auth'

interface GetMembershipResponse {
  membership: {
    id: string
    role: Roles
    userId: string
    organizationId: string
  }
}

export async function getMembership(org: string) {
  const result = await api
    .get(`organization/${org}/membership`)
    .json<GetMembershipResponse>()

  return result
}
