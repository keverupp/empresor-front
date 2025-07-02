"use client";

import * as React from "react";
import { RowData, Column } from "@tanstack/react-table";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import {
  Eye,
  Search,
  GripVertical,
  Settings,
  Save,
  RotateCcw,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DataTableViewOptionsProps } from "./interfaces";
import { cn } from "@/lib/utils";

interface ColumnConfig {
  id: string;
  label: string;
  visible: boolean;
  order: number;
}

export function DataTableViewOptions<TData extends RowData>({
  table,
  columnLabels = {},
  className,
  storageKey = "data-table-columns-visibility",
}: DataTableViewOptionsProps<TData>) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isOpen, setIsOpen] = React.useState(false);
  const [columns, setColumns] = React.useState<ColumnConfig[]>([]);

  const getColumnDisplayName = React.useMemo(() => {
    return (columnId: string) => {
      if (columnLabels[columnId]) return columnLabels[columnId];
      const columnNames: Record<string, string> = {
        name: "Nome",
        patientName: "Paciente",
        procedure: "Procedimento",
        date: "Data",
        amount: "Valor",
        status: "Status",
        email: "E-mail",
        phone: "Telefone",
        telefone: "Telefone",
        address: "Endereço",
        createdAt: "Criado em",
        updatedAt: "Atualizado em",
        ultimaConsulta: "Última Consulta",
        id: "ID",
      };
      return columnNames[columnId] || columnId;
    };
  }, [columnLabels]);

  const loadColumnConfig = React.useCallback((): ColumnConfig[] | null => {
    if (storageKey && typeof window !== "undefined") {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  }, [storageKey]);

  // Use ref to track if initial setup is done
  const initializedRef = React.useRef(false);

  React.useEffect(() => {
    // Only run initial setup once
    if (initializedRef.current) return;

    const tableColumns = table
      .getAllColumns()
      .filter((column: Column<TData, unknown>) => column.getCanHide())
      .map((column: Column<TData, unknown>, index: number) => ({
        id: column.id,
        label: getColumnDisplayName(column.id),
        visible: column.getIsVisible(),
        order: index,
      }));

    const savedConfig = loadColumnConfig();
    let initialColumns = tableColumns;

    if (savedConfig) {
      const savedMap = new Map(savedConfig.map((c) => [c.id, c]));
      const merged = tableColumns.map((col) => {
        const saved = savedMap.get(col.id);
        return saved
          ? { ...col, visible: saved.visible, order: saved.order }
          : col;
      });
      merged.sort((a, b) => a.order - b.order);
      initialColumns = merged;
    }

    setColumns(initialColumns);

    initialColumns.forEach((col) => {
      table.getColumn(col.id)?.toggleVisibility(col.visible);
    });

    const orderedIds = initialColumns.map((col) => col.id);
    table.setColumnOrder(orderedIds);

    initializedRef.current = true;
  }, [table, loadColumnConfig, getColumnDisplayName]);

  const saveColumnConfig = (config: ColumnConfig[]) => {
    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(config));
    }
  };

  const handleVisibilityChange = (columnId: string, visible: boolean) => {
    const updatedColumns = columns.map((col) =>
      col.id === columnId ? { ...col, visible } : col
    );
    setColumns(updatedColumns);
    table.getColumn(columnId)?.toggleVisibility(visible);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const reordered = Array.from(columns);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);

    const updatedColumns = reordered.map((col, index) => ({
      ...col,
      order: index,
    }));
    setColumns(updatedColumns);

    const orderedIds = updatedColumns.map((col) => col.id);
    table.setColumnOrder(orderedIds);
  };

  const handleSave = () => {
    saveColumnConfig(columns);
    setIsOpen(false);
  };

  const handleReset = () => {
    const defaultColumns = table
      .getAllColumns()
      .filter((column: Column<TData, unknown>) => column.getCanHide())
      .map((column: Column<TData, unknown>, index: number) => ({
        id: column.id,
        label: getColumnDisplayName(column.id),
        visible: true,
        order: index,
      }));
    setColumns(defaultColumns);
    defaultColumns.forEach((col) =>
      table.getColumn(col.id)?.toggleVisibility(true)
    );
    table.resetColumnOrder();
    if (storageKey) {
      localStorage.removeItem(storageKey);
    }
  };

  const filteredColumns = columns.filter(
    (col) =>
      col.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      col.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const visibleCount = columns.filter((col) => col.visible).length;
  const totalCount = columns.length;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("shrink-0", className)}
        >
          <Eye className="mr-2 h-4 w-4" />
          Colunas
          <Badge variant="secondary" className="ml-2">
            {visibleCount}/{totalCount}
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 max-h-[80vh] overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between p-2">
          <DropdownMenuLabel className="p-0 flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configurar Colunas
          </DropdownMenuLabel>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            title="Resetar configurações"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
        <DropdownMenuSeparator />
        <div className="p-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar colunas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-8"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-6 w-6 p-0"
                onClick={() => setSearchTerm("")}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
        <div className="flex-grow overflow-y-auto">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="columns">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {filteredColumns.map((column, index) => (
                    <Draggable
                      key={column.id}
                      draggableId={column.id}
                      index={index}
                    >
                      {(providedDraggable) => (
                        <div
                          ref={providedDraggable.innerRef}
                          {...providedDraggable.draggableProps}
                          className="flex items-center gap-2 p-2 border-b last:border-b-0 hover:bg-muted/50"
                        >
                          <div {...providedDraggable.dragHandleProps}>
                            <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                          </div>
                          <input
                            type="checkbox"
                            checked={column.visible}
                            onChange={(e) =>
                              handleVisibilityChange(
                                column.id,
                                e.target.checked
                              )
                            }
                            className="rounded"
                          />
                          <div className="flex-1 min-w-0 font-medium text-sm truncate">
                            {column.label}
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
        <DropdownMenuSeparator />
        <div className="flex items-center justify-end p-2 gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Save className="mr-1 h-3 w-3" />
            Salvar
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
