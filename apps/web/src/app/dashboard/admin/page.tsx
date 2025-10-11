"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { AuthGuard } from "@/components/auth-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BarVotes from "@/components/charts/bar-chart";
import PieShare from "@/components/charts/pie-chart";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface KPIData {
  registered: number;
  verified: number;
  votesCast: number;
  participation: number;
}

interface VoteDistribution {
  byCandidate: Array<{ id: string; name: string; votes: number }>;
}

export default function AdminDashboardPage() {
  const { data: kpis } = useSWR<KPIData>("/analytics/kpis", fetcher, {
    fallbackData: {
      registered: 0,
      verified: 0,
      votesCast: 0,
      participation: 0,
    },
  });
  const { data: dist } = useSWR<VoteDistribution>("/analytics/votes", fetcher, {
    fallbackData: { byCandidate: [] },
  });

  return (
    <AuthGuard role="admin">
      <main className="min-h-dvh bg-background text-foreground p-6">
        <header className="mx-auto max-w-6xl mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/candidates">Manage Candidates</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/users">Manage Users</Link>
            </Button>
            <Button asChild>
              <Link href="/analytics">View Analytics</Link>
            </Button>
          </div>
        </header>

        <section className="mx-auto max-w-6xl grid gap-4 md:grid-cols-4">
          <KpiCard title="Registered" value={kpis?.registered ?? 0} />
          <KpiCard title="Verified" value={kpis?.verified ?? 0} />
          <KpiCard title="Votes Cast" value={kpis?.votesCast ?? 0} />
          <KpiCard title="Participation %" value={kpis?.participation ?? 0} />
        </section>

        <section className="mx-auto max-w-6xl grid gap-6 mt-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Votes per Candidate</CardTitle>
            </CardHeader>
            <CardContent>
              <BarVotes data={dist?.byCandidate || []} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Vote Share</CardTitle>
            </CardHeader>
            <CardContent>
              <PieShare data={dist?.byCandidate || []} />
            </CardContent>
          </Card>
        </section>
      </main>
    </AuthGuard>
  );
}

function KpiCard({ title, value }: { title: string; value: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}
