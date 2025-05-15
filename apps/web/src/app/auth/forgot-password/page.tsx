import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  return (
    <form className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="email">Email</Label>
        <Input name="email" type="email" id="email" placeholder="E-mail " />
      </div>

      <Button className="w-full" type="submit">
        Recover password
      </Button>

      <Button asChild className="size-sm w-full" type="submit" variant="link">
        <Link href="/auth/sign-in">Sign in instead</Link>
      </Button>
    </form>
  )
}
