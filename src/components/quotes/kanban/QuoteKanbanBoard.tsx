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
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/quote-utils";
import {
  FileText,
  User,
  Package,
  DollarSign,
  ExternalLink,
  GripVertical,
  MonitorX,
} from "lucide-react";

interface QuoteKanbanBoardProps {
  quotes: Quote[];
  onStatusChange?: (
    quoteId: string,
    status: QuoteStatus
  ) => Promise<boolean> | boolean;
}

const statusOrder = Object.keys(QUOTE_STATUS_CONFIG) as QuoteStatus[];

const statusVariantMap: Record<
  QuoteStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  draft: "outline",
  pending: "secondary",
  approved: "default",
  rejected: "destructive",
  expired: "secondary",
} as any;

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
        "w-full transition-all duration-200 hover:shadow-md",
        "cursor-grab active:cursor-grabbing",
        "min-w-0", // evita overflow
        isOverlay && "pointer-events-none shadow-lg rotate-3 scale-105"
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div className="min-w-0">
              <CardTitle className="text-sm font-medium truncate">
                #{quote.quote_number}
              </CardTitle>
            </div>
          </div>
          <GripVertical className="h-4 w-4 text-muted-foreground opacity-50" />
        </div>
      </CardHeader>

      <CardContent className="pt-0 pb-3 space-y-3">
        {quote.client?.name && (
          <div className="flex items-center gap-2 text-sm min-w-0">
            <User className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            <span className="truncate text-muted-foreground">
              {quote.client.name}
            </span>
          </div>
        )}

        <Separator />

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Package className="h-3 w-3" />
            <span>
              {quote.items.length} {quote.items.length === 1 ? "item" : "itens"}
            </span>
          </div>
          <div className="flex items-center gap-1 font-medium">
            <DollarSign className="h-3 w-3" />
            <span>{formatCurrency(quote.total_amount_cents)}</span>
          </div>
        </div>

        {!isOverlay && (
          <>
            <Separator />
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-center gap-2 h-8"
              asChild
              onPointerDown={(e) => e.stopPropagation()}
            >
              <Link
                href={`/dashboard/companies/${quote.company_id}/quotes/${quote.id}`}
              >
                <ExternalLink className="h-3 w-3" />
                Abrir Cotação
              </Link>
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function QuoteCard({ quote, status }: { quote: Quote; status: QuoteStatus }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: quote.id,
    data: { status },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  } as React.CSSProperties;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="mb-3 min-w-0 w-full max-w-full"
    >
      <QuoteCardContent quote={quote} />
    </div>
  );
}

function StatusColumn({
  status,
  quotes,
  className,
}: {
  status: QuoteStatus;
  quotes: Quote[];
  className?: string;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: { status },
  });

  const config = QUOTE_STATUS_CONFIG[status];
  const variant = statusVariantMap[status] || "default";

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex h-full w-full min-w-[15rem] flex-col rounded-lg border bg-card transition-colors",
        "sm:min-w-[16rem] lg:min-w-[18rem]",
        isOver && "bg-accent/50",
        className
      )}
    >
      <div className="p-3 pb-2 sm:p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <h3 className="font-semibold text-sm">{config.label}</h3>
            <Badge variant={variant} className="text-xs">
              {quotes.length}
            </Badge>
          </div>
        </div>
        <Separator className="mt-3" />
      </div>

      <div className="flex-1 p-2 pt-1 sm:p-3 lg:p-4 min-h-[420px] md:min-h-[460px] lg:min-h-[500px]">
        <SortableContext
          items={quotes.map((q) => q.id)}
          strategy={verticalListSortingStrategy}
        >
          {quotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <div className="rounded-full bg-muted p-3 mb-2">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">Nenhuma cotação</p>
            </div>
          ) : (
            quotes.map((quote) => (
              <QuoteCard key={quote.id} quote={quote} status={status} />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
}

export function QuoteKanbanBoard({
  quotes,
  onStatusChange,
}: QuoteKanbanBoardProps) {
  const [columns, setColumns] = useState<Record<QuoteStatus, Quote[]>>(() =>
    groupByStatus(quotes)
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

  const totalQuotes = quotes.length;

  return (
    <div className="p-3 md:p-4 lg:p-6 xl:p-8">
      <div className="space-y-3 md:space-y-4 min-w-0 w-full max-w-full">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold">Board de Cotações</h2>
            <p className="text-sm text-muted-foreground">
              {totalQuotes} {totalQuotes === 1 ? "cotação" : "cotações"} no
              total
            </p>
          </div>
        </div>

        {/* Aviso para telas pequenas */}
        <div className="md:hidden">
          <Card className="border-dashed">
            <CardHeader>
              <div className="flex items-start gap-3">
                <MonitorX className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <CardTitle className="text-base">
                    Tela muito pequena
                  </CardTitle>
                  <CardDescription>
                    O kanban não é compatível com esta resolução. Aumente a
                    largura da janela ou use um dispositivo com tela maior.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        <DndContext
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div className="hidden md:block">
            <div
              className={cn(
                "grid grid-flow-col auto-cols-[minmax(15rem,1fr)]",
                "gap-3 lg:gap-4",
                "overflow-x-auto pb-2 pr-2",
                "xl:[grid-auto-columns:minmax(18rem,1fr)]"
              )}
            >
              {statusOrder.map((status) => (
                <StatusColumn
                  key={status}
                  status={status}
                  quotes={columns[status] || []}
                />
              ))}
            </div>
          </div>

          <DragOverlay>
            {activeQuote ? (
              <QuoteCardContent quote={activeQuote} isOverlay />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
