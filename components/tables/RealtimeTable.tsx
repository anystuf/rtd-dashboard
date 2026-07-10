"use client";

import { fmt } from "@/lib/utils";

export interface ColumnDef<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
}

export function RealtimeTable<T extends { id?: string }>({
  rows,
  columns,
  empty = "No rows yet. Run the sync worker first."
}: {
  rows: T[];
  columns: ColumnDef<T>[];
  empty?: string;
}) {
  if (!rows.length) return <div className="rounded-2xl border bg-white p-6 text-sm text-slate-500">{empty}</div>;

  return (
    <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
      <div className="max-h-[72vh] overflow-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm table-sticky">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((col) => <th key={String(col.key)} className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{col.label}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {rows.map((row, idx) => (
              <tr key={row.id || idx} className="hover:bg-slate-50">
                {columns.map((col) => (
                  <td key={String(col.key)} className="max-w-xs whitespace-nowrap px-4 py-3 text-slate-700">
                    {col.render ? col.render(row) : fmt((row as Record<string, unknown>)[String(col.key)])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
