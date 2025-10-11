"use client"

import { BarChart as RBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export default function BarVotes({ data }: { data: Array<{ id: string; name: string; votes: number }> }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RBarChart data={data || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" hide={false} />
          <YAxis />
          <Tooltip />
          <Bar dataKey="votes" fill="hsl(var(--primary))" />
        </RBarChart>
      </ResponsiveContainer>
    </div>
  )
}
