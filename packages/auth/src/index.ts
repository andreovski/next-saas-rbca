import {
  createMongoAbility,
  ForcedSubject,
  CreateAbility,
  MongoAbility,
  AbilityBuilder,
} from '@casl/ability'
import { User } from './models/user'
import { permissions } from './permissions'
import { userSubject, UserSubject } from './subjects/user'
import { projectSubject, ProjectSubject } from './subjects/project'
import { z } from 'zod'
import { organizationSubject } from './subjects/organization'
import { inviteSubject } from './subjects/invite'
import { billingSubject } from './subjects/billing'

export * from './models/user'
export * from './models/organization'
export * from './models/project'

const appAbilitiesSchema = z.union([
  projectSubject,
  userSubject,
  organizationSubject,
  inviteSubject,
  billingSubject,

  z.tuple([z.enum(['manage']), z.literal('all')]),
])

type AppAbilities = z.infer<typeof appAbilitiesSchema>

export type AppAbility = MongoAbility<AppAbilities>
export const createAppAbility = createMongoAbility as CreateAbility<AppAbility>

export function defineAbilityFor(user: User) {
  const builder = new AbilityBuilder(createAppAbility)

  if (typeof permissions[user.role] !== 'function') {
    throw new Error(`Permission for role ${user.role} not found`)
  }

  permissions[user.role](user, builder)

  const ability = builder.build({
    detectSubjectType: (item) => {
      return item.__typename
    },
  })

  return ability
}
