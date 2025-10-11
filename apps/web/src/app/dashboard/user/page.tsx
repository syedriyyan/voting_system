"use client";

import useSWR from "swr";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetcher } from "@/lib/api";
import { AuthGuard } from "@/components/auth-guard";
import { getRole } from "@/lib/auth";

interface UserData {
  name?: string;
  verified?: boolean;
  email?: string;
  walletAddress?: string;
}

interface Election {
  _id: string;
  title: string;
  status: string;
  startDate?: string;
  endDate?: string;
}

export default function UserDashboardPage() {
  const role = getRole();
  const { data: me } = useSWR<UserData>("/auth/me", fetcher, {
    fallbackData: {},
  });
  const { data: elections = [] } = useSWR<Election[]>("/elections", fetcher);

  return (
    <AuthGuard role="voter">
      <main className="min-h-dvh bg-background text-foreground p-6">
        <div className="mx-auto max-w-5xl grid gap-6">
          <h1 className="text-2xl font-semibold">
            Welcome{me?.name ? `, ${me.name}` : ""}
          </h1>

          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Verification Status</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {me?.verified ? "Verified" : "Pending verification"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Active Elections</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {elections?.length ?? 0}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Role</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground capitalize">
                  {role || "voter"}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Ready to vote?</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-4">
              <p className="text-muted-foreground">
                View the ballot and securely cast your encrypted vote.
              </p>
              <Button asChild>
                <Link href="/vote">Vote Now</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </AuthGuard>
  );
}
