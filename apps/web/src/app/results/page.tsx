"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BarVotes from "@/components/charts/bar-chart";
import PieShare from "@/components/charts/pie-chart";

interface ResultsData {
  winner?: {
    name: string;
    votes: number;
  };
  byCandidate: Array<{
    id: string;
    name: string;
    votes: number;
    share: number;
  }>;
}

export default function ResultsPage() {
  const { data } = useSWR<ResultsData>("/results", fetcher, {
    fallbackData: { byCandidate: [] },
  });

  return (
    <main className="min-h-dvh bg-background text-foreground p-6">
      <div className="mx-auto max-w-6xl grid gap-6">
        <header>
          <h1 className="text-2xl font-semibold">Election Results</h1>
          {data?.winner && (
            <p className="text-muted-foreground mt-1">
              Winner: {data.winner.name} ({data.winner.votes} votes)
            </p>
          )}
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Votes per Candidate</CardTitle>
            </CardHeader>
            <CardContent>
              <BarVotes data={data?.byCandidate || []} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Vote Share</CardTitle>
            </CardHeader>
            <CardContent>
              <PieShare data={data?.byCandidate || []} />
            </CardContent>
          </Card>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-muted-foreground">
                  <tr className="text-left">
                    <th className="py-2 pr-4">Candidate</th>
                    <th className="py-2 pr-4">Votes</th>
                    <th className="py-2">Share</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.byCandidate?.map((row: any) => (
                    <tr key={row.id} className="border-t">
                      <td className="py-2 pr-4">{row.name}</td>
                      <td className="py-2 pr-4">{row.votes}</td>
                      <td className="py-2">{row.share}%</td>
                    </tr>
                  )) || null}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
