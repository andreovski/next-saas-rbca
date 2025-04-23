import { defineAbilityFor } from '@saas/auth'

const ability = defineAbilityFor({ role: 'MEMBER', id: 'userId' })

console.log('🚀 ~ userCanInviteSomeoneElse:', ability.can('get', 'Billing'))
