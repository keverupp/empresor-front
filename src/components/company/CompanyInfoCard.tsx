// src/components/company/CompanyInfoCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Settings,
  FileText,
  Edit,
} from "lucide-react";
import type { Company } from "@/types/company";
import { formatters } from "@/config/app";

interface CompanyInfoCardProps {
  company: Company | null;
  isLoading: boolean;
}

export function CompanyInfoCard({ company, isLoading }: CompanyInfoCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  if (!company) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48">
          <p className="text-muted-foreground">
            Erro ao carregar informações da empresa
          </p>
        </CardContent>
      </Card>
    );
  }

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

  const getCompanyInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const formatAddress = () => {
    if (!company.address) return "Endereço não informado";

    const addressParts = [
      company.address.street,
      company.address.number,
      company.address.neighborhood,
      company.address.city,
      company.address.state,
    ].filter(Boolean);

    return addressParts.join(", ") || "Endereço não informado";
  };

  const statusBadge = getStatusBadge(company.status);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Informações da Empresa</span>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Header com avatar e informações básicas */}
        <div className="flex items-start space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage
              src={company.logo_url || undefined}
              alt={company.name}
            />
            <AvatarFallback className="text-lg">
              {getCompanyInitials(company.name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2">
            <div>
              <h3 className="text-xl font-semibold">{company.name}</h3>
            </div>

            <div className="flex items-center space-x-2">
              <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
              <Badge variant="outline">
                <FileText className="h-3 w-3 mr-1" />
                {company.document_number}
              </Badge>
            </div>
          </div>
        </div>

        <Separator />

        {/* Informações de contato */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center">
            <Building2 className="h-4 w-4 mr-2" />
            Informações de Contato
          </h4>

          <div className="grid gap-2 text-sm">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{company.email}</span>
            </div>

            {company.phone && (
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{company.phone}</span>
              </div>
            )}

            <div className="flex items-start space-x-2">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <span className="flex-1">{formatAddress()}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Informações adicionais */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Criada em</p>
            <p className="font-medium">{formatters.date(company.created_at)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Atualizada em</p>
            <p className="font-medium">{formatters.date(company.updated_at)}</p>
          </div>
        </div>

        {/* Ações rápidas */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
