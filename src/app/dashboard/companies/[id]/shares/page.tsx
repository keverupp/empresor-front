"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { useApi } from "@/hooks/useApi";
import type { CompanyShare } from "@/types/company";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { appConfig } from "@/config/app";
import { toast } from "sonner";

export default function CompanySharesPage() {
  const params = useParams();
  const companyId = params.id as string;
  const { get, post, delete: del } = useApi();

  const [shares, setShares] = useState<CompanyShare[]>([]);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchShares = useCallback(async () => {
    setIsLoading(true);
    const { data } = await get<CompanyShare[]>(
      appConfig.urls.api.endpoints.companies.shares(companyId)
    );
    if (data) setShares(data);
    setIsLoading(false);
  }, [companyId, get]);

  useEffect(() => {
    fetchShares();
  }, [fetchShares]);

  const handleShare = useCallback(async () => {
    if (!email) return;
    setIsSubmitting(true);
    const { error } = await post(
      appConfig.urls.api.endpoints.companies.shares(companyId),
      {
        email,
        permissions: {
          can_view_clients: true,
          can_create_quotes: true,
          can_edit_settings: false,
          can_view_finance: true,
          can_manage_products: true,
          can_view_reports: true,
        },
      }
    );
    setIsSubmitting(false);
    if (!error) {
      toast.success("Empresa compartilhada com sucesso");
      setEmail("");
      fetchShares();
    }
  }, [companyId, email, post, fetchShares]);

  const handleRemove = useCallback(
    async (userId: number) => {
      const { error } = await del(
        appConfig.urls.api.endpoints.companies.removeShare(
          companyId,
          userId.toString()
        )
      );
      if (!error) {
        toast.success("Compartilhamento removido");
        setShares((prev) => prev.filter((s) => s.user_id !== userId));
      }
    },
    [companyId, del]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleShare();
  };

  return (
    <DashboardLayout title="Compartilhamentos">
      <div className="p-4 space-y-4">
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-md">
          <Input
            type="email"
            placeholder="E-mail do usuário"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button type="submit" disabled={!email || isSubmitting}>
            Compartilhar
          </Button>
        </form>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shares.map((share) => (
              <TableRow key={share.share_id}>
                <TableCell>{share.name}</TableCell>
                <TableCell>{share.email}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    onClick={() => handleRemove(share.user_id)}
                  >
                    Remover
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {!isLoading && shares.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center text-sm text-muted-foreground"
                >
                  Nenhum compartilhamento encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </DashboardLayout>
  );
}

