// src/components/company/CompanyHeaderSection.tsx
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText } from "lucide-react";
import type { CompanyApiResponse } from "@/hooks/useCompanyDetail";
import { formatCNPJ, detectDocumentType } from "@/lib/format-utils";

interface CompanyHeaderSectionProps {
  company: CompanyApiResponse | null;
  isLoading: boolean;
}

export function CompanyHeaderSection({
  company,
  isLoading,
}: CompanyHeaderSectionProps) {
  const getCompanyInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: "Ativa", variant: "default" as const },
      pending: { label: "Pendente", variant: "secondary" as const },
      pending_validation: { label: "Pendente", variant: "secondary" as const },
      inactive: { label: "Inativa", variant: "destructive" as const },
      suspended: { label: "Suspensa", variant: "destructive" as const },
    };

    return (
      statusConfig[status as keyof typeof statusConfig] || {
        label: status,
        variant: "outline" as const,
      }
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-start space-x-6">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="flex-1 space-y-3">
              <div>
                <Skeleton className="h-8 w-64 mb-2" />
                <Skeleton className="h-5 w-48 mb-1" />
                <Skeleton className="h-4 w-40" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
        </CardHeader>
      </Card>
    );
  }

  if (!company) {
    return null;
  }

  const statusBadge = getStatusBadge(company.status);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start space-x-6">
          <Avatar className="h-20 w-20">
            <AvatarImage
              src={company.logo_url || undefined}
              alt={company.name}
            />
            <AvatarFallback className="text-xl">
              {getCompanyInitials(company.name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-3">
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold">
                {company.name}
              </h1>
              {company.legal_name && (
                <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
                  {company.legal_name}
                </p>
              )}
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground flex items-center gap-2 mt-1">
                <FileText className="h-4 w-4" />
                {detectDocumentType(company.document_number)}:{" "}
                {formatCNPJ(company.document_number)}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
