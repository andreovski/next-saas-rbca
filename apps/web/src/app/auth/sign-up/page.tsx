import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'

import githubIcon from '@/assets/github-icon.svg'
import Image from 'next/image'

export default function SignUpPage() {
  return (
    <form className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="name">Name</Label>
        <Input name="name" type="text" id="name" placeholder="Name" />
      </div>
      <div className="space-y-1">
        <Label htmlFor="password">Password</Label>
        <Input
          name="password"
          type="password"
          id="password"
          placeholder="E-mail "
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="password_confirmation">Confirm your password</Label>
        <Input
          name="password_confirmation"
          type="password"
          id="password_confirmation"
          placeholder="E-mail "
        />
      </div>

      <Button className="w-full" type="submit">
        Create account
      </Button>
      <Button asChild className="size-sm w-full" type="submit" variant="link">
        <Link href="/auth/sign-in">Already registered? Sign in</Link>
      </Button>

      <Separator />

      <Button className="w-full" type="submit" variant="outline">
        <Image src={githubIcon} className="mr-2 size-4 dark:invert" alt="" />
        Sign up with GitHub
      </Button>
    </form>
  )
}
