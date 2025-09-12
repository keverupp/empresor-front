"use client";

import { useParams } from "next/navigation";

import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { SectionCards } from "@/components/section-cards";
import { useCompanyDashboardData } from "@/hooks/useCompanyDashboardData";

export default function CompanyReportsPage() {
  const params = useParams();
  const companyId = params.id as string;
  const { summary } = useCompanyDashboardData(companyId);

  return (
    <DashboardLayout
      title="Relatórios"
      description="Resumo de desempenho da empresa"
    >
      <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
        <SectionCards summary={summary} />
      </div>
    </DashboardLayout>
  );
}
