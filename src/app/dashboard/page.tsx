"use client";

import {
  DashboardLayout,
  useDashboardLayout,
} from "@/components/layouts/DashboardLayout";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import data from "./data.json";

export default function DashboardPage() {
  const { createBreadcrumbs } = useDashboardLayout();

  const breadcrumbs = createBreadcrumbs([
    { label: "Dashboard", href: "/dashboard" },
  ]);

  return (
    <DashboardLayout
      title="Dashboard"
      description="Visão geral dos seus negócios e métricas importantes"
      breadcrumbs={breadcrumbs}
    >
      <div className="@container/main flex flex-1 flex-col gap-6 px-4 py-6 md:px-6">
        <SectionCards />
        <ChartAreaInteractive />
        <DataTable data={data} />
      </div>
    </DashboardLayout>
  );
}
