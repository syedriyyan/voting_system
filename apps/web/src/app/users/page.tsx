"use client";

import useSWR from "swr";
import { fetcher, patch } from "@/lib/api";
import { AuthGuard } from "@/components/auth-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface User {
  id: string;
  name: string;
  voterId: string;
  verified: boolean;
  email?: string;
}

export default function UsersPage() {
  const { data: users = [], mutate } = useSWR<User[]>("/users", fetcher);

  async function verifyUser(id: string) {
    await patch(`/users/verify/${id}`, {}).catch(() => {});
    mutate();
  }

  return (
    <AuthGuard role="admin">
      <main className="min-h-dvh bg-background text-foreground p-6">
        <div className="mx-auto max-w-6xl grid gap-6">
          <header>
            <h1 className="text-2xl font-semibold">Users</h1>
          </header>

          <Card>
            <CardHeader>
              <CardTitle>Voters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-muted-foreground">
                    <tr className="text-left">
                      <th className="py-2 pr-4">Name</th>
                      <th className="py-2 pr-4">Voter ID</th>
                      <th className="py-2 pr-4">Verified</th>
                      <th className="py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users?.map((u: any) => (
                      <tr key={u.id} className="border-t">
                        <td className="py-2 pr-4">{u.name}</td>
                        <td className="py-2 pr-4">{u.voterId}</td>
                        <td className="py-2 pr-4">
                          {u.verified ? "Yes" : "No"}
                        </td>
                        <td className="py-2">
                          {!u.verified ? (
                            <Button size="sm" onClick={() => verifyUser(u.id)}>
                              Verify
                            </Button>
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
