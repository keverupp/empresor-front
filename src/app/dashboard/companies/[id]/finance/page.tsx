"use client";

import { useParams } from "next/navigation";

import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { SectionCards } from "@/components/section-cards";
import { DashboardQuotesTable } from "@/components/dashboard-quotes-table";
import { useCompanyDashboardData } from "@/hooks/useCompanyDashboardData";

export default function CompanyFinancePage() {
  const params = useParams();
  const companyId = params.id as string;
  const { summary, quotations, isLoading } = useCompanyDashboardData(companyId);

  return (
    <DashboardLayout
      title="Financeiro"
      description="Visão financeira da empresa"
    >
      <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
        <SectionCards summary={summary} />
        <DashboardQuotesTable data={quotations} isLoading={isLoading} />
      </div>
    </DashboardLayout>
  );
}
