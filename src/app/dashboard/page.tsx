// src/app/dashboard/page.tsx
"use client";

import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { ChartBarInteractive } from "@/components/chart-bar-interactive";
import { SectionCards } from "@/components/section-cards";
import { DashboardQuotesTable } from "@/components/dashboard-quotes-table";
import { useDashboard } from "@/hooks/useDashboard";

export default function DashboardPage() {
  const { summary, timeline, quotations, isLoading } = useDashboard();

  return (
    <DashboardLayout
      title="Dashboard Geral"
      description="Visão geral de todas as suas empresas e atividades"
    >
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards summary={summary} />
          <div className="px-4 lg:px-6">
            <ChartBarInteractive data={timeline} />
          </div>
          <DashboardQuotesTable data={quotations} isLoading={isLoading} />
        </div>
      </div>
    </DashboardLayout>
  );
}

