"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl px-4 py-3 shadow-lg">
      <p style={{ fontSize: "12px", color: "#6B7280", marginBottom: "2px" }}>{label}</p>
      <p style={{ fontSize: "16px", fontWeight: 700, color: "#0d9488" }}>
        {payload[0].value}{" "}
        <span style={{ fontSize: "12px", fontWeight: 400, color: "#6B7280" }}>appts</span>
      </p>
    </div>
  );
};

/**
 * Renders a line chart of appointment counts over the last N days.
 *
 * @param {object[]} appointments  - raw appointment rows from DB
 * @param {number}   days          - how many past days to show (default 7)
 * @param {string}   dateField     - field name for the date ("date")
 */
export function AppointmentsLineChart({ appointments = [], days = 7, dateField = "date" }) {
  // Build the last `days` dates as labels
  const data = Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    const key = d.toISOString().split("T")[0]; // "YYYY-MM-DD"
    const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const count = appointments.filter((a) => a[dateField] === key).length;
    return { date: label, count };
  });

  const hasData = data.some((d) => d.count > 0);

  return (
    <div className="bg-white rounded-xl p-4 sm:p-6 border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div>
          <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#111827" }}>
            Appointments Trend
          </h3>
          <p style={{ fontSize: "13px", color: "#6B7280", marginTop: "2px" }}>
            Last {days} days
          </p>
        </div>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: "#0d948815" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        </div>
      </div>

      {!hasData ? (
        <div className="flex items-center justify-center h-40 text-[#9CA3AF]" style={{ fontSize: "14px" }}>
          No appointment data yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#9CA3AF" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11, fill: "#9CA3AF" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#E5E7EB", strokeWidth: 1 }} />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#0d9488"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "#0d9488", strokeWidth: 0 }}
              activeDot={{ r: 6, fill: "#0d9488", stroke: "#fff", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
