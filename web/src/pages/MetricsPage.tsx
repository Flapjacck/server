/* Metrics page — Phase 4 stub.
   Displays host CPU and RAM time series as recharts AreaCharts.
   Data is generated mock time series; real data comes from cAdvisor or docker stats in Phase 4. */

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader } from "../components/ui/Card";
import { mockHostMetrics } from "../mock/data";
import styles from "./MetricsPage.module.css";

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/** Shared chart configuration keeps visual language consistent between panels */
function MetricChart({
  data,
  label,
  color,
  unit,
  current,
}: {
  data: { time: string; value: number }[];
  label: string;
  color: string;
  unit: string;
  current: number;
}) {
  const chartData = data.map((p) => ({ ...p, time: formatTime(p.time) }));

  return (
    <Card>
      <CardHeader
        title={label}
        description="Last 30 minutes — 30-second intervals"
        action={
          <span className={styles.currentValue}>
            {current.toFixed(1)}{unit}
          </span>
        }
      />
      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData} margin={{ top: 4, right: 16, bottom: 0, left: -8 }}>
            <defs>
              <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.15} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              vertical={false}
            />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 11, fill: "var(--text-tertiary)", fontFamily: "Geist Mono, monospace" }}
              tickLine={false}
              axisLine={false}
              interval={9}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: "var(--text-tertiary)", fontFamily: "Geist Mono, monospace" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}${unit}`}
              width={38}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                fontSize: "12px",
                color: "var(--text-primary)",
                fontFamily: "Geist Mono, monospace",
              }}
              formatter={(val) => [`${(val as number).toFixed(1)}${unit}`, label]}
              labelStyle={{ color: "var(--text-secondary)" }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={1.5}
              fill={`url(#grad-${label})`}
              dot={false}
              activeDot={{ r: 3, stroke: color, fill: "var(--bg-elevated)" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export function MetricsPage() {
  const { cpu, ram, cpuCurrent, ramCurrent, ramTotalGib } = mockHostMetrics;
  const ramPct = parseFloat(((ramCurrent / 100) * ramTotalGib).toFixed(1));

  return (
    <div className={styles.page}>
      <div className={styles.heading}>
        <h1 className={styles.title}>Metrics</h1>
        <p className={styles.subtitle}>
          Host resource usage — Phase 4 will connect cAdvisor or docker stats for live data.
        </p>
      </div>

      {/* Stat summary cards */}
      <div className={styles.statRow}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>CPU Usage</span>
          <span className={styles.statValue}>{cpuCurrent.toFixed(1)}%</span>
          <span className={styles.statSub}>host average</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>RAM Usage</span>
          <span className={styles.statValue}>{ramCurrent.toFixed(1)}%</span>
          <span className={styles.statSub}>{ramPct} / {ramTotalGib} GiB</span>
        </div>
      </div>

      {/* Charts */}
      <MetricChart
        data={cpu}
        label="CPU"
        color="var(--accent)"
        unit="%"
        current={cpuCurrent}
      />
      <MetricChart
        data={ram}
        label="RAM"
        color="var(--ok)"
        unit="%"
        current={ramCurrent}
      />

      <p className={styles.notice}>
        Phase 4 stub — data is randomly generated. Connect cAdvisor or call docker stats in the API to feed live values.
      </p>
    </div>
  );
}
