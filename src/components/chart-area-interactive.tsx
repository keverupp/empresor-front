"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { TimelineItem } from "@/hooks/useDashboard";

interface ChartAreaInteractiveProps {
  data: TimelineItem[];
}

export function ChartAreaInteractive({ data }: ChartAreaInteractiveProps) {
  const chartData = React.useMemo(
    () =>
      data.map((item) => ({
        date: item.period,
        sent: item.sent,
        accepted: item.accepted,
      })),
    [data]
  );

  const chartConfig = {
    sent: {
      label: "Enviados",
      color: "hsl(var(--chart-1))",
    },
    accepted: {
      label: "Aceitos",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Orçamentos por Período</CardTitle>
        <CardDescription>Enviados x Aceitos</CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Area
              dataKey="sent"
              type="monotone"
              stroke="var(--color-sent)"
              fill="var(--color-sent)"
              fillOpacity={0.2}
            />
            <Area
              dataKey="accepted"
              type="monotone"
              stroke="var(--color-accepted)"
              fill="var(--color-accepted)"
              fillOpacity={0.2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

