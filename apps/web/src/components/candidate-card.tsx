"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function CandidateCard({
  candidate,
  selected,
  onSelect,
}: {
  candidate: { id: string; name: string; party?: string; symbolUrl?: string; bio?: string }
  selected?: boolean
  onSelect?: () => void
}) {
  return (
    <Card className={selected ? "border-primary" : ""}>
      <CardHeader className="flex flex-row items-center gap-3">
        <img
          src={candidate.symbolUrl || "/placeholder.svg?height=40&width=40&query=candidate%20symbol"}
          alt={`${candidate.name} symbol`}
          className="h-10 w-10 rounded"
        />
        <CardTitle className="leading-none">{candidate.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-muted-foreground">{candidate.party || "Independent"}</p>
        {candidate.bio ? <p className="text-sm">{candidate.bio}</p> : null}
        {onSelect ? (
          <Button onClick={onSelect} variant={selected ? "default" : "outline"} size="sm">
            {selected ? "Selected" : "Select"}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  )
}
