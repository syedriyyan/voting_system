"use client"

import Link from "next/link"

export default function Sidebar() {
  return (
    <aside className="border-r bg-background h-full w-full md:w-64 p-4">
      <nav className="grid gap-2 text-sm">
        <Link href="/dashboard/admin" className="hover:underline">
          Overview
        </Link>
        <Link href="/elections" className="hover:underline">
          Elections
        </Link>
        <Link href="/candidates" className="hover:underline">
          Candidates
        </Link>
        <Link href="/users" className="hover:underline">
          Users
        </Link>
        <Link href="/analytics" className="hover:underline">
          Analytics
        </Link>
        <Link href="/results" className="hover:underline">
          Results
        </Link>
      </nav>
    </aside>
  )
}
