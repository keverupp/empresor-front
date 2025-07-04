// src/components/company/CompanySystemInfo.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "lucide-react";
import type { CompanyApiResponse } from "@/hooks/useCompanyDetail";
import { formatters } from "@/config/app";

interface CompanySystemInfoProps {
  company: CompanyApiResponse | null;
  isLoading: boolean;
}

export function CompanySystemInfo({
  company,
  isLoading,
}: CompanySystemInfoProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-5 w-32" />
            </div>
            <div>
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-5 w-32" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Informações do Sistema
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Criada em
            </p>
            <p className="font-medium">
              {company ? formatters.date(company.created_at) : "—"}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Última atualização
            </p>
            <p className="font-medium">
              {company ? formatters.date(company.updated_at) : "—"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
