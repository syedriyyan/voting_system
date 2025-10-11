"use client";

import useSWR from "swr";
import { useState } from "react";
import { fetcher, post } from "@/lib/api";
import { AuthGuard } from "@/components/auth-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CandidateCard from "@/components/candidate-card";
import ConfirmDialog from "@/components/confirm-dialog";
import { encryptVote } from "@/lib/encryption";
import { useToast } from "@/hooks/use-toast";

interface Election {
  id: string;
  title: string;
  description?: string;
  publicKey?: string;
  startDate?: string;
  endDate?: string;
}

interface Candidate {
  id: string;
  name: string;
  party: string;
  imageUrl?: string;
  symbolUrl?: string;
  bio?: string;
}

export default function VotePage() {
  const { data: election } = useSWR<Election>("/elections/active", fetcher);
  const { data: candidates = [] } = useSWR<Candidate[]>(
    election?.id
      ? `/candidates?electionId=${encodeURIComponent(election.id)}`
      : null,
    fetcher
  );
  const [selected, setSelected] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  async function submitVote() {
    try {
      setLoading(true);
      const encryptedVote = await encryptVote(selected, election?.publicKey);
      await post("/votes", { encryptedVote, electionId: election?.id });
      toast({
        title: "Vote cast",
        description: "Your vote has been cast successfully.",
      });
      setOpen(false);
    } catch (err: any) {
      toast({
        title: "Vote failed",
        description: err?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthGuard role="voter">
      <main className="min-h-dvh bg-background text-foreground p-6">
        <div className="mx-auto max-w-5xl grid gap-6">
          <header>
            <h1 className="text-2xl font-semibold">
              {election?.title || "Ballot"}
            </h1>
            <p className="text-muted-foreground">{election?.description}</p>
          </header>

          <div className="grid gap-4 md:grid-cols-2">
            {candidates?.map((c: any) => (
              <CandidateCard
                key={c.id}
                candidate={c}
                selected={selected === c.id}
                onSelect={() => setSelected(c.id)}
              />
            )) || (
              <Card>
                <CardHeader>
                  <CardTitle>No candidates</CardTitle>
                </CardHeader>
                <CardContent>—</CardContent>
              </Card>
            )}
          </div>

          <div className="flex justify-end">
            <Button disabled={!selected} onClick={() => setOpen(true)}>
              Submit Vote
            </Button>
          </div>

          <ConfirmDialog
            open={open}
            onOpenChange={setOpen}
            title="Confirm your selection"
            description="Once submitted, you cannot change your vote."
            confirmText={loading ? "Submitting..." : "Confirm and Submit"}
            onConfirm={submitVote}
            disabled={loading}
          />
        </div>
      </main>
    </AuthGuard>
  );
}
