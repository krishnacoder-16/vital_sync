"use client";

import {
  PieChart, Pie, Cell, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";

const COLORS = {
  Scheduled: "#F59E0B",
  Confirmed: "#10B981",
  Cancelled: "#EF4444",
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 shadow-lg">
      <p style={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>{name}</p>
      <p style={{ fontSize: "16px", fontWeight: 700, color: COLORS[name] || "#0d9488" }}>
        {value}{" "}
        <span style={{ fontSize: "12px", fontWeight: 400, color: "#6B7280" }}>
          {value === 1 ? "appt" : "appts"}
        </span>
      </p>
    </div>
  );
};

const CustomLegend = ({ payload }) => (
  <div className="flex items-center justify-center gap-5 mt-4">
    {payload.map((entry) => (
      <div key={entry.value} className="flex items-center gap-1.5">
        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
        <span style={{ fontSize: "12px", color: "#6B7280", fontWeight: 500 }}>{entry.value}</span>
      </div>
    ))}
  </div>
);

/**
 * Pie chart showing the distribution of appointment statuses.
 *
 * @param {object[]} appointments - raw appointment rows from DB
 */
export function StatusPieChart({ appointments = [] }) {
  const counts = { Scheduled: 0, Confirmed: 0, Cancelled: 0 };
  for (const a of appointments) {
    const key = a.status.charAt(0).toUpperCase() + a.status.slice(1);
    if (key in counts) counts[key]++;
  }

  const data = Object.entries(counts)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="bg-white rounded-xl p-6 border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#111827" }}>
            Status Breakdown
          </h3>
          <p style={{ fontSize: "13px", color: "#6B7280", marginTop: "2px" }}>
            {total} total appointment{total !== 1 ? "s" : ""}
          </p>
        </div>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: "#10B98115" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" />
          </svg>
        </div>
      </div>

      {total === 0 ? (
        <div className="flex items-center justify-center h-40 text-[#9CA3AF]" style={{ fontSize: "14px" }}>
          No appointment data yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={78}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={COLORS[entry.name] || "#0d9488"} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
