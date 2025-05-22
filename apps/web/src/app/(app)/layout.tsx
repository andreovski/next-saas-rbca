import { isAuthenticated } from '@/auth/auth'
import { redirect } from 'next/navigation'

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const authenticad = await isAuthenticated()

  if (!authenticad) {
    redirect('auth/sign-in')
  }

  return <>{children}</>
}
