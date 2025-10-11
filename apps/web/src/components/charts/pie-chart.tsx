"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "hsl(var(--muted))",
  "hsl(var(--accent))",
  "hsl(var(--foreground))",
];

export default function PieShare({
  data,
}: {
  data: Array<{ id: string; name: string; votes?: number; share?: number }>;
}) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data || []}
            dataKey={data[0]?.share !== undefined ? "share" : "votes"}
            nameKey="name"
            outerRadius={90}
            fill="hsl(var(--primary))"
            label
          >
            {(data || []).map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
