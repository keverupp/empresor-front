// src/components/clients/ClientDetailPage.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { useClientDetail } from "@/hooks/useClientDetail";
import { formatDocument } from "@/lib/client-utils";

import { ClientActions } from "./ClientActions";
import { ClientDetailTabs } from "./ClientDetailTabs";

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.id as string;
  const clientId = params.clientId as string;
  const [isEditing, setIsEditing] = useState(false);

  const {
    client,
    isLoading,
    isUpdating,
    isDeleting,
    fetchClient,
    updateClient,
    deleteClient,
  } = useClientDetail(companyId, clientId);

  useEffect(() => {
    if (companyId && clientId) {
      fetchClient();
    }
  }, [companyId, clientId, fetchClient]);

  const handleDelete = async (): Promise<boolean> => {
    const success = await deleteClient();
    if (success) {
      router.push(`/dashboard/companies/${companyId}/clients`);
    }
    return success;
  };

  const pageTitle = (
    <div className="flex items-center gap-3">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push(`/dashboard/companies/${companyId}/clients`)}
        className="p-2"
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <div>
        {isLoading ? (
          <Skeleton className="h-7 w-48" />
        ) : (
          <>
            <h1 className="text-xl font-semibold">
              {client?.name || "Cliente"}
            </h1>
            {client?.document_number && (
              <p className="text-sm text-muted-foreground">
                {formatDocument(client.document_number)}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );

  const pageActions = (
    <ClientActions
      client={client}
      isEditing={isEditing}
      isLoading={isLoading}
      isUpdating={isUpdating}
      isDeleting={isDeleting}
      companyId={companyId}
      clientId={clientId}
      onEdit={() => setIsEditing(true)}
      onCancelEdit={() => setIsEditing(false)}
      onDelete={handleDelete}
    />
  );

  return (
    <DashboardLayout title={pageTitle} actions={pageActions}>
      <div className="space-y-6 p-4">
        <ClientDetailTabs
          client={client}
          isLoading={isLoading}
          isEditing={isEditing}
          isUpdating={isUpdating}
          updateClient={updateClient}
          onCancelEdit={() => setIsEditing(false)}
        />
      </div>
    </DashboardLayout>
  );
}
