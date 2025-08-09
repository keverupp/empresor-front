"use client";

import { Card } from "@/components/ui/card";
import { Mail, Phone, User, MapPin } from "lucide-react";
import type { Client, Quote } from "@/types/apiInterfaces";

type Props = {
  client: Client;
  quote: Quote;
};

export function QuoteViewClient({ client }: Props) {
  const lines: string[] = [];
  if (client.address_street) lines.push(client.address_street);
  if (client.address_city || client.address_state) {
    lines.push(
      [client.address_city, client.address_state].filter(Boolean).join(" - ")
    );
  }

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div className="rounded-full p-2 bg-muted text-muted-foreground">
          <User className="h-5 w-5" />
        </div>

        <div className="flex-1 space-y-1">
          <h2 className="font-semibold text-base">Cliente</h2>
          <div className="text-sm">
            <div className="font-medium">{client.name}</div>
            {client.document_number && (
              <div className="text-muted-foreground">
                Documento: {client.document_number}
              </div>
            )}
          </div>

          <div className="text-sm text-muted-foreground mt-2 grid gap-1">
            {client.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>{client.email}</span>
              </div>
            )}
            {client.phone_number && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>{client.phone_number}</span>
              </div>
            )}
            {lines.length > 0 && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5" />
                <div className="space-y-0.5">
                  {lines.map((l, i) => (
                    <div key={i}>{l}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
