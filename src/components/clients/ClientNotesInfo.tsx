// src/components/clients/ClientNotesInfo.tsx
"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

const notesSchema = z.object({
  notes: z.string().optional().or(z.literal("")),
});

type NotesFormData = z.infer<typeof notesSchema>;

interface ClientNotesInfoProps {
  client: any;
  isLoading: boolean;
  isEditing: boolean;
  isUpdating: boolean;
  updateClient: (data: any) => Promise<boolean>;
  onCancelEdit: () => void;
}

export function ClientNotesInfo({
  client,
  isLoading,
  isEditing,
  isUpdating,
  updateClient,
  onCancelEdit,
}: ClientNotesInfoProps) {
  const form = useForm<NotesFormData>({
    resolver: zodResolver(notesSchema),
    defaultValues: {
      notes: "",
    },
  });

  useEffect(() => {
    if (client) {
      form.reset({
        notes: client.notes || "",
      });
    }
  }, [client, form]);

  const handleSave = async (data: NotesFormData) => {
    const updateData = {
      notes: data.notes === "" ? "N/F" : data.notes,
    };

    const success = await updateClient(updateData);
    if (success) {
      onCancelEdit();
    }
  };

  const handleCancelEdit = () => {
    if (client) {
      form.reset({
        notes: client.notes || "",
      });
    }
    onCancelEdit();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Observações
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : isEditing ? (
          <div className="space-y-4">
            <Textarea
              {...form.register("notes")}
              placeholder="Observações sobre o cliente..."
              rows={4}
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50"
                disabled={isUpdating}
              >
                Cancelar
              </button>
              <button
                onClick={form.handleSubmit(handleSave)}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                disabled={isUpdating}
              >
                {isUpdating ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-sm whitespace-pre-wrap">
            {client?.notes || "Nenhuma observação cadastrada."}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
