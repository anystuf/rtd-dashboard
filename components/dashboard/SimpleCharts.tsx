"use client";

import { Bar, BarChart, CartesianGrid, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell, Legend } from "recharts";

export function BarDistribution({ title, data, nameKey = "name", valueKey = "value" }: { title: string; data: Record<string, unknown>[]; nameKey?: string; valueKey?: string }) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-slate-900">{title}</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 16, right: 16, top: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey={nameKey} type="category" width={110} />
            <Tooltip />
            <Bar dataKey={valueKey} radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function PieDistribution({ title, data, nameKey = "name", valueKey = "value" }: { title: string; data: Record<string, unknown>[]; nameKey?: string; valueKey?: string }) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-slate-900">{title}</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey={valueKey} nameKey={nameKey} outerRadius={90} label />
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
