'use server'

import { signUp } from '@/http/sign-up'
import { HTTPError } from 'ky'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { z } from 'zod'

const signUpSchema = z
  .object({
    name: z.string().refine((name) => name.split(' ').length > 1, {
      message: 'Please, provide your full name. ',
    }),
    email: z.string().email({ message: 'Please, provide a valid e-mail. ' }),
    password: z
      .string()
      .min(6, { message: 'Password should have at least 6 characters. ' }),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match. ',
    path: ['password_confirmation'],
  })

export async function signUpAction(data: FormData) {
  const result = signUpSchema.safeParse(Object.fromEntries(data))

  if (!result.success) {
    return {
      success: false,
      message: null,
      errors: result.error.flatten().fieldErrors,
    }
  }

  const { name, email, password } = result.data

  try {
    await signUp({
      name,
      email,
      password,
    })
  } catch (error) {
    if (error instanceof HTTPError) {
      const { message } = await error.response.json()

      return { success: false, message, errors: null }
    }

    console.error('Error sign up:', error)

    return {
      success: false,
      message: 'An unexpected error occurred. Please try again later.',
      errors: null,
    }
  }

  return [
    {
      success: true,
      message: null,
      errors: null,
    },
    redirect('/auth/sign-in'),
  ]
}
