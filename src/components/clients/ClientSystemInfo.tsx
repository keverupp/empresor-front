// src/components/clients/ClientSystemInfo.tsx
"use client";

import { Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ClientSystemInfoProps {
  client: any;
  isLoading: boolean;
}

const formatDate = (dateString: string): string => {
  if (!dateString) return "";

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
};

export function ClientSystemInfo({ client, isLoading }: ClientSystemInfoProps) {
  if (isLoading || !client) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Informações do Sistema
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-3">
            <div>
              <span className="text-sm text-muted-foreground block">
                Cadastrado em:
              </span>
              <span className="text-sm font-medium">
                {formatDate(client.created_at)}
              </span>
            </div>
            <div>
              <span className="text-sm text-muted-foreground block">
                Última atualização:
              </span>
              <span className="text-sm font-medium">
                {formatDate(client.updated_at)}
              </span>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-muted-foreground block">
                ID do Cliente:
              </span>
              <Badge variant="outline" className="font-mono text-xs">
                {client.id}
              </Badge>
            </div>
            <div>
              <span className="text-sm text-muted-foreground block">
                ID da Empresa:
              </span>
              <Badge variant="outline" className="font-mono text-xs">
                {client.company_id}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
