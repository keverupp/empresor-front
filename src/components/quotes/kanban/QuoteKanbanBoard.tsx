"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Quote } from "@/types/apiInterfaces";
import type { QuoteStatus } from "@/types/quote";
import { QUOTE_STATUS_CONFIG } from "@/types/quote";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/quote-utils";

interface QuoteKanbanBoardProps {
  quotes: Quote[];
  onStatusChange?: (
    quoteId: string,
    status: QuoteStatus,
  ) => Promise<boolean> | boolean;
}

const statusOrder = Object.keys(QUOTE_STATUS_CONFIG) as QuoteStatus[];

const borderColorMap: Record<(typeof QUOTE_STATUS_CONFIG)[keyof typeof QUOTE_STATUS_CONFIG]["color"], string> = {
  gray: "border-gray-500",
  blue: "border-blue-500",
  yellow: "border-yellow-500",
  green: "border-green-500",
  red: "border-red-500",
  orange: "border-orange-500",
  purple: "border-purple-500",
};

function groupByStatus(quotes: Quote[]): Record<QuoteStatus, Quote[]> {
  const grouped = statusOrder.reduce((acc, status) => {
    acc[status] = [];
    return acc;
  }, {} as Record<QuoteStatus, Quote[]>);
  quotes.forEach((quote) => {
    grouped[quote.status]?.push(quote);
  });
  return grouped;
}

function QuoteCardContent({
  quote,
  isOverlay = false,
}: {
  quote: Quote;
  isOverlay?: boolean;
}) {
  return (
    <Card
      className={cn(
        "w-64 cursor-grab active:cursor-grabbing",
        isOverlay && "pointer-events-none",
      )}
    >
      <CardHeader className="p-2">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium">
              #{quote.quote_number}
            </CardTitle>
            <CardDescription className="text-xs">
              {quote.client?.name}
            </CardDescription>
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>{quote.items.length} itens</span>
              <span>{formatCurrency(quote.total_amount_cents)}</span>
            </div>
          </div>
          {!isOverlay && (
            <Button
              variant="outline"
              size="sm"
              asChild
              onPointerDown={(e) => e.stopPropagation()}
            >
              <Link
                href={`/dashboard/companies/${quote.company_id}/quotes/${quote.id}`}
              >
                Abrir
              </Link>
            </Button>
          )}
        </div>
      </CardHeader>
    </Card>
  );
}

function QuoteCard({ quote, status }: { quote: Quote; status: QuoteStatus }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: quote.id,
    data: { status },
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  } as React.CSSProperties;

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="mb-2">
      <QuoteCardContent quote={quote} />
    </div>
  );
}

function StatusColumn({
  status,
  quotes,
}: {
  status: QuoteStatus;
  quotes: Quote[];
}) {
  const { setNodeRef } = useDroppable({ id: status, data: { status } });
  const config = QUOTE_STATUS_CONFIG[status];
  return (
    <div
      ref={setNodeRef}
      className="flex w-64 flex-col rounded-md border bg-muted p-2"
    >
      <h3
        className={cn(
          "mb-2 rounded-md border-b p-2 text-sm font-medium",
          borderColorMap[config.color],
        )}
      >
        {config.label}
      </h3>
      <SortableContext items={quotes.map((q) => q.id)} strategy={verticalListSortingStrategy}>
        {quotes.map((quote) => (
          <QuoteCard key={quote.id} quote={quote} status={status} />
        ))}
      </SortableContext>
    </div>
  );
}

export function QuoteKanbanBoard({ quotes, onStatusChange }: QuoteKanbanBoardProps) {
  const [columns, setColumns] = useState<Record<QuoteStatus, Quote[]>>(() =>
    groupByStatus(quotes),
  );
  const [activeQuote, setActiveQuote] = useState<Quote | null>(null);

  useEffect(() => {
    setColumns(groupByStatus(quotes));
  }, [quotes]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const status = active.data.current?.status as QuoteStatus | undefined;
    if (!status) return;
    const quote = columns[status].find((q) => q.id === active.id) || null;
    setActiveQuote(quote);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveQuote(null);
    if (!over) return;
    const fromStatus = active.data.current?.status as QuoteStatus | undefined;
    const toStatus = over.data.current?.status as QuoteStatus | undefined;
    if (!fromStatus || !toStatus) return;

    if (fromStatus === toStatus) {
      setColumns((prev) => {
        const column = prev[fromStatus];
        const oldIndex = column.findIndex((q) => q.id === active.id);
        const newIndex = column.findIndex((q) => q.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return prev;
        return {
          ...prev,
          [fromStatus]: arrayMove(column, oldIndex, newIndex),
        };
      });
      return;
    }

    setColumns((prev) => {
      const activeQuote = prev[fromStatus].find((q) => q.id === active.id);
      if (!activeQuote) return prev;
      const next = { ...prev } as Record<QuoteStatus, Quote[]>;
      next[fromStatus] = prev[fromStatus].filter((q) => q.id !== active.id);
      const updatedQuote = { ...activeQuote, status: toStatus };
      next[toStatus] = [updatedQuote, ...prev[toStatus]];
      return next;
    });

    const success = await onStatusChange?.(active.id as string, toStatus);
    if (success === false) {
      // Reverte mudança visual em caso de falha
      setColumns((prev) => {
        const movedQuote = prev[toStatus].find((q) => q.id === active.id);
        if (!movedQuote) return prev;
        const next = { ...prev } as Record<QuoteStatus, Quote[]>;
        next[toStatus] = prev[toStatus].filter((q) => q.id !== active.id);
        const revertedQuote = { ...movedQuote, status: fromStatus };
        next[fromStatus] = [revertedQuote, ...prev[fromStatus]];
        return next;
      });
    }
  };

  const handleDragCancel = () => setActiveQuote(null);

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex gap-4 overflow-x-auto p-4">
        {statusOrder.map((status) => (
          <StatusColumn
            key={status}
            status={status}
            quotes={columns[status] || []}
          />
        ))}
      </div>
      <DragOverlay>
        {activeQuote ? <QuoteCardContent quote={activeQuote} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}

