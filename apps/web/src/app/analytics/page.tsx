"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LineTrend from "@/components/charts/line-chart";
import BarVotes from "@/components/charts/bar-chart";
import { AuthGuard } from "@/components/auth-guard";

interface VoteDistribution {
  byCandidate: Array<{ id: string; name: string; votes: number }>;
}

interface TimelineData {
  points: Array<{ t: string; count: number }>;
}

export default function AnalyticsPage() {
  const { data: dist } = useSWR<VoteDistribution>("/analytics/votes", fetcher, {
    fallbackData: { byCandidate: [] },
  });
  const { data: timeline } = useSWR<TimelineData>(
    "/analytics/timeline",
    fetcher,
    {
      fallbackData: { points: [] },
    }
  );

  // Transform data if necessary for the line chart
  const timelineData = timeline?.points || [];

  return (
    <AuthGuard role="admin">
      <main className="min-h-dvh bg-background text-foreground p-6">
        <div className="mx-auto max-w-6xl grid gap-6">
          <header>
            <h1 className="text-2xl font-semibold">Analytics</h1>
          </header>
          <section className="grid gap-6 md:grid-cols-2">
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
                <CardTitle>Voting Activity Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <LineTrend data={timelineData} />
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </AuthGuard>
  );
}
