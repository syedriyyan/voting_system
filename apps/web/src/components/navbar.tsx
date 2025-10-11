"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getRole, clearAuth } from "@/lib/auth"
import { useRouter } from "next/navigation"

export default function Navbar() {
  const role = getRole()
  const router = useRouter()

  function logout() {
    clearAuth()
    router.replace("/")
  }

  return (
    <nav className="w-full border-b bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-semibold">
          SecureVote
        </Link>
        <div className="flex items-center gap-3">
          <Link className="text-sm text-muted-foreground hover:underline" href="/results">
            Results
          </Link>
          {role === "admin" && (
            <>
              <Link className="text-sm text-muted-foreground hover:underline" href="/dashboard/admin">
                Admin
              </Link>
              <Link className="text-sm text-muted-foreground hover:underline" href="/analytics">
                Analytics
              </Link>
            </>
          )}
          {role === "voter" && (
            <>
              <Link className="text-sm text-muted-foreground hover:underline" href="/dashboard/user">
                Dashboard
              </Link>
              <Link className="text-sm text-muted-foreground hover:underline" href="/vote">
                Vote
              </Link>
            </>
          )}
          {role ? (
            <Button size="sm" variant="outline" onClick={logout}>
              Logout
            </Button>
          ) : (
            <Button size="sm" asChild>
              <Link href="/auth/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  )
}
