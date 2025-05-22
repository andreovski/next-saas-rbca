'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'

import githubIcon from '@/assets/github-icon.svg'
import Image from 'next/image'
import { useFormState } from '@/hooks/use-form-state'
import { signUpAction } from './actions'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { signInWithGithub } from '../actions'

export default function SignUpForm() {
  const [{ success, message, errors }, handleSubmit, isPending] =
    useFormState(signUpAction)

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        {!success && message && (
          <Alert variant="destructive">
            <AlertTriangle className="size-4" />
            <AlertTitle>Sign in failed</AlertTitle>

            <AlertDescription>
              <p>{message}</p>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-1">
          <Label htmlFor="name">Name</Label>
          <Input name="name" type="text" id="name" placeholder="Name" />

          {errors?.name && (
            <p className="text-xs text-red-500 dark:text-red-400">
              {errors.name[0]}
            </p>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="email">E-mail</Label>
          <Input name="email" type="email" id="email" placeholder="Name" />

          {errors?.email && (
            <p className="text-xs text-red-500 dark:text-red-400">
              {errors.email[0]}
            </p>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="password">Password</Label>
          <Input
            name="password"
            type="password"
            id="password"
            placeholder="E-mail "
          />

          {errors?.password && (
            <p className="text-xs text-red-500 dark:text-red-400">
              {errors.password[0]}
            </p>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="password_confirmation">Confirm your password</Label>
          <Input
            name="password_confirmation"
            type="password"
            id="password_confirmation"
            placeholder="Confirm your password "
          />

          {errors?.password_confirmation && (
            <p className="text-xs text-red-500 dark:text-red-400">
              {errors.password_confirmation[0]}
            </p>
          )}
        </div>

        <Button className="w-full" type="submit" disabled={isPending}>
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            'Create account'
          )}
        </Button>

        <Button
          asChild
          className="size-sm w-full"
          type="submit"
          variant="link"
          disabled={isPending}
        >
          <Link href="/auth/sign-in">Already registered? Sign in</Link>
        </Button>
      </form>

      <form action={signInWithGithub}>
        <Separator />

        <Button
          className="w-full"
          type="submit"
          variant="outline"
          disabled={isPending}
        >
          <Image src={githubIcon} className="mr-2 size-4 dark:invert" alt="" />
          Sign up with GitHub
        </Button>
      </form>
    </div>
  )
}
