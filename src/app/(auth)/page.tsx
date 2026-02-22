import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export default async function RootPage() {
  // TODO: Check Convex Auth
  const isAuthenticated = true // Temporary bypass

  if (isAuthenticated) {
    redirect('/dashboard')
  } else {
    redirect('/login')
  }
}
