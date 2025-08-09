// _components/ProductCombobox.tsx
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { ChevronsUpDown, Check, PackageOpen } from "lucide-react";
import { formatCurrency } from "@/lib/quote-utils";
import type { Product } from "@/types/apiInterfaces";

export function ProductCombobox({
  products,
  selectedId,
  onPick,
}: {
  products: Product[];
  selectedId?: string;
  onPick: (product: Product) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = products.find((p) => p.id === selectedId);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          className="w-full justify-between"
        >
          {selected ? (
            <span className="truncate">{selected.name}</span>
          ) : (
            <span className="inline-flex items-center gap-2">
              <PackageOpen className="h-4 w-4 opacity-60" />
              Selecionar produto
            </span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command>
          <CommandInput placeholder="Buscar produto..." />
          <CommandList>
            <CommandEmpty>Nenhum produto encontrado.</CommandEmpty>
            <CommandGroup>
              {products.map((p) => (
                <CommandItem
                  key={p.id}
                  value={p.name}
                  onSelect={() => {
                    onPick(p);
                    setOpen(false);
                  }}
                >
                  <div className="min-w-0">
                    <div className="truncate">{p.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatCurrency(p.unit_price_cents)}
                    </div>
                  </div>
                  <Check
                    className={[
                      "ml-auto h-4 w-4",
                      selectedId === p.id ? "opacity-100" : "opacity-0",
                    ].join(" ")}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
