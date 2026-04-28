import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { IconLoader2, IconChartBar } from "@tabler/icons-react";
import { useStats } from "../hooks/useStats";
import { COLUMN_CONFIG, COLUMN_ORDER } from "../constants/board";
import type { ApplicationStatus } from "../types";

// Colors for pie chart slices matching column config.
const STATUS_COLORS: Record<ApplicationStatus, string> = {
  saved: "#888780",
  applied: "#378ADD",
  screening: "#7F77DD",
  interview: "#534AB7",
  offer: "#1D9E75",
  rejected: "#E24B4A",
  withdrawn: "#B4B2A9",
};

// Stat card component for summary numbers.
function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="bg-surface-secondary rounded-xl p-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-medium text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const { data: stats, isLoading, isError } = useStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <IconLoader2 size={24} className="animate-spin" />
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="flex items-center justify-center h-full text-red-500 text-sm">
        Failed to load statistics. Please refresh the page.
      </div>
    );
  }

  // Build pie chart data from by_status.
  const pieData = COLUMN_ORDER.map((status) => {
    const found = stats.by_status.find((s) => s.status === status);
    return {
      name: COLUMN_CONFIG[status].label,
      value: found?.count ?? 0,
      status,
    };
  }).filter((d) => d.value > 0);

  // Build bar chart data from weekly counts.
  const barData = stats.weekly.map((w) => ({
    week: w.week.slice(5),
    count: w.count,
  }));

  // Build funnel data showing conversion through key stages.
  const funnelData = ["applied", "screening", "interview", "offer"].map(
    (status) => {
      const found = stats.by_status.find((s) => s.status === status);
      return {
        name: COLUMN_CONFIG[status as ApplicationStatus].label,
        count: found?.count ?? 0,
      };
    },
  );

  return (
    <div className="flex flex-col h-full overflow-auto">
      {/* Topbar */}
      <div className="bg-surface border-b border-border px-6 py-3.5 shrink-0">
        <h1 className="text-sm font-medium text-gray-900">Dashboard</h1>
      </div>

      <div className="p-6 space-y-6">
        {/* Summary stats */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard label="Total applications" value={stats.total} />
          <StatCard
            label="Response rate"
            value={`${Math.round(stats.response_rate)}%`}
            sub="applications with a response"
          />
          <StatCard
            label="Offer rate"
            value={`${Math.round(stats.offer_rate)}%`}
            sub="applications that led to an offer"
          />
          <StatCard
            label="Active"
            value={
              (stats.by_status.find((s) => s.status === "screening")?.count ??
                0) +
              (stats.by_status.find((s) => s.status === "interview")?.count ??
                0)
            }
            sub="in screening or interview"
          />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-2 gap-4">
          {/* Weekly activity bar chart */}
          <div className="bg-surface border border-border rounded-xl p-5">
            <p className="text-xs font-medium text-gray-700 mb-4">
              Weekly activity
            </p>
            {barData.length === 0 ? (
              <EmptyChart message="No activity data yet" />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={barData} barSize={20}>
                  <XAxis
                    dataKey="week"
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      fontSize: 12,
                      borderRadius: 8,
                      border: "0.5px solid #e5e7eb",
                      boxShadow: "none",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="#534AB7"
                    radius={[4, 4, 0, 0]}
                    name="Applications"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Status breakdown pie chart */}
          <div className="bg-surface border border-border rounded-xl p-5">
            <p className="text-xs font-medium text-gray-700 mb-4">
              Status breakdown
            </p>
            {pieData.length === 0 ? (
              <EmptyChart message="No applications yet" />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry) => (
                      <Cell
                        key={entry.status}
                        fill={STATUS_COLORS[entry.status as ApplicationStatus]}
                      />
                    ))}
                  </Pie>
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{
                      fontSize: 12,
                      borderRadius: 8,
                      border: "0.5px solid #e5e7eb",
                      boxShadow: "none",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Funnel chart */}
        <div className="bg-surface border border-border rounded-xl p-5">
          <p className="text-xs font-medium text-gray-700 mb-4">
            Recruitment funnel
          </p>
          {funnelData.every((d) => d.count === 0) ? (
            <EmptyChart message="No funnel data yet" />
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={funnelData} layout="vertical" barSize={20}>
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  axisLine={false}
                  tickLine={false}
                  width={70}
                />
                <Tooltip
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 8,
                    border: "0.5px solid #e5e7eb",
                    boxShadow: "none",
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="#1D9E75"
                  radius={[0, 4, 4, 0]}
                  name="Applications"
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

// Empty state for charts with no data.
function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-50 text-gray-400">
      <IconChartBar size={24} className="mb-2" />
      <p className="text-xs">{message}</p>
    </div>
  );
}
