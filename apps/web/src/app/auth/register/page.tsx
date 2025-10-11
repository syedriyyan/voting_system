"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { register as apiRegister } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", voterId: "", dob: "", address: "" })
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  function update<K extends keyof typeof form>(key: K, val: string) {
    setForm((f) => ({ ...f, [key]: val }))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const data = new FormData()
      data.append("name", form.name)
      data.append("voterId", form.voterId)
      data.append("dob", form.dob)
      data.append("address", form.address)
      if (file) data.append("document", file)
      await apiRegister(data)
      toast({ title: "Registration submitted", description: "Your verification is pending." })
      router.replace("/auth/login")
    } catch (err: any) {
      toast({ title: "Registration failed", description: err?.message || "Try again.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-dvh grid place-items-center bg-background text-foreground p-4">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>Register</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={form.name} onChange={(e) => update("name", e.target.value)} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="voterId">Voter ID</Label>
                <Input id="voterId" value={form.voterId} onChange={(e) => update("voterId", e.target.value)} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input id="dob" type="date" value={form.dob} onChange={(e) => update("dob", e.target.value)} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" value={form.address} onChange={(e) => update("address", e.target.value)} required />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="document">Verification Document (image/PDF)</Label>
              <Input
                id="document"
                type="file"
                accept=".png,.jpg,.jpeg,.pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit"}
            </Button>
            <p className="text-sm text-muted-foreground">
              After submission your account will be reviewed by an administrator.
            </p>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
