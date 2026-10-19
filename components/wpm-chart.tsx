"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAppearance } from "@/components/appearance-provider";
import { ACCENT_PRESETS, THEME_COLORS } from "@/lib/appearance";

export type WpmPoint = {
  race: number;
  wpm: number;
  title: string;
  date: string;
};

type ChartTooltipProps = {
  active?: boolean;
  payload?: Array<{ payload: WpmPoint }>;
};

export function WpmChart({ data }: { data: WpmPoint[] }) {
  const { appearance } = useAppearance();
  const colors = THEME_COLORS[appearance.theme];
  const preset = ACCENT_PRESETS[appearance.accent];
  const accent = appearance.theme === "light" ? preset.hexLight : preset.hex;

  return (
    <div className="h-60 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 8, right: 8, bottom: 0, left: -18 }}
        >
          <CartesianGrid
            stroke={colors.line}
            strokeDasharray="3 3"
            vertical={false}
          />
          <XAxis
            dataKey="race"
            tick={{ fill: colors.subtle, fontSize: 10 }}
            tickLine={false}
            axisLine={{ stroke: colors.line }}
            minTickGap={24}
          />
          <YAxis
            domain={[0, "auto"]}
            tick={{ fill: colors.subtle, fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            width={40}
          />
          <Tooltip
            cursor={{ stroke: colors.line, strokeWidth: 1 }}
            content={<ChartTooltip />}
          />
          <Line
            type="monotone"
            dataKey="wpm"
            stroke={accent}
            strokeWidth={2}
            dot={{
              r: 3,
              fill: colors.surface,
              stroke: accent,
              strokeWidth: 2,
            }}
            activeDot={{ r: 4, fill: accent, stroke: colors.surface }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function ChartTooltip({ active, payload }: ChartTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const point = payload[0]?.payload;

  if (!point) {
    return null;
  }

  return (
    <div className="rounded-md border border-line bg-surface px-3 py-2">
      <p className="font-mono text-sm text-ink">{point.wpm.toFixed(1)} WPM</p>
      <p className="mt-1 max-w-52 truncate text-xs text-subtle">
        {point.title}
      </p>
      <p className="mt-1 font-mono text-[10px] text-subtle">{point.date}</p>
    </div>
  );
}
