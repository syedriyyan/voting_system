"use client";

import type React from "react";

import useSWR from "swr";
import { useState } from "react";
import { fetcher, post } from "@/lib/api";
import { AuthGuard } from "@/components/auth-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Candidate {
  id: string;
  name: string;
  party: string;
  symbolUrl?: string;
}

export default function CandidatesPage() {
  const { data: list = [], mutate } = useSWR<Candidate[]>(
    "/candidates",
    fetcher
  );
  const [form, setForm] = useState({ name: "", party: "", symbolUrl: "" });
  const [loading, setLoading] = useState(false);

  async function createCandidate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await post("/candidates", form).catch(() => {});
    setLoading(false);
    setForm({ name: "", party: "", symbolUrl: "" });
    mutate();
  }

  return (
    <AuthGuard role="admin">
      <main className="min-h-dvh bg-background text-foreground p-6">
        <div className="mx-auto max-w-5xl grid gap-6">
          <header className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Candidates</h1>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>Add Candidate</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={createCandidate}
                className="grid md:grid-cols-3 gap-4"
              >
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="party">Party</Label>
                  <Input
                    id="party"
                    value={form.party}
                    onChange={(e) =>
                      setForm({ ...form, party: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="symbol">Symbol URL</Label>
                  <Input
                    id="symbol"
                    value={form.symbolUrl}
                    onChange={(e) =>
                      setForm({ ...form, symbolUrl: e.target.value })
                    }
                  />
                </div>
                <div className="md:col-span-3">
                  <Button type="submit" disabled={loading}>
                    {loading ? "Creating..." : "Create"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>All Candidates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-muted-foreground">
                    <tr className="text-left">
                      <th className="py-2 pr-4">Name</th>
                      <th className="py-2 pr-4">Party</th>
                      <th className="py-2">Symbol</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list?.map((c: any) => (
                      <tr key={c.id} className="border-t">
                        <td className="py-2 pr-4">{c.name}</td>
                        <td className="py-2 pr-4">{c.party}</td>
                        <td className="py-2">
                          {c.symbolUrl ? (
                            <img
                              src={c.symbolUrl || "/placeholder.svg"}
                              alt={`${c.name} symbol`}
                              className="h-6 w-6"
                            />
                          ) : (
                            "—"
                          )}
                        </td>
                      </tr>
                    )) || null}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </AuthGuard>
  );
}
