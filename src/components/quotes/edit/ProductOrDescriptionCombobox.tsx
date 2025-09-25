"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown, PackagePlus, Type } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/apiInterfaces";

type Props = {
  products: Product[];
  placeholder?: string;
  description?: string;
  selectedProductId?: string;
  onPickProduct: (p: Product) => void;
  onPickCustom: (description: string) => void;
  /** se true, pressionar Enter confirma o que estiver digitado como avulso */
  confirmOnEnter?: boolean;
  /** id opcional para acessibilidade do input */
  inputId?: string;
};

export const ProductOrDescriptionCombobox = forwardRef<
  { focus: () => void },
  Props
>(function ProductOrDescriptionCombobox(
  {
    products,
    placeholder = "Selecione ou adicione um produto",
    description,
    selectedProductId,
    onPickProduct,
    onPickCustom,
    confirmOnEnter = true,
    inputId,
  },
  ref
) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(description ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => {
      setOpen(true);
      setTimeout(() => inputRef.current?.focus(), 0);
    },
  }));

  useEffect(() => {
    setQuery(description ?? "");
  }, [description]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, query]);

  const currentLabel = useMemo(() => {
    const p = selectedProductId
      ? products.find((x) => x.id === selectedProductId)
      : undefined;
    return p?.name ?? description ?? "";
  }, [products, selectedProductId, description]);

  const handleConfirmCustom = () => {
    const desc = query.trim();
    if (!desc) return;
    onPickCustom(desc);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {currentLabel || (
            <span className="text-muted-foreground overflow-hidden">
              {placeholder}
            </span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="p-0 min-w-full">
        <Command
          filter={(value, search) =>
            value.toLowerCase().includes(search.toLowerCase()) ? 1 : 0
          }
        >
          <CommandInput
            id={inputId}
            ref={inputRef}
            placeholder="Buscar produto ou digitar descrição…"
            value={query}
            onValueChange={setQuery}
            onKeyDown={(e) => {
              if (confirmOnEnter && e.key === "Enter") {
                e.preventDefault();
                handleConfirmCustom();
              }
            }}
          />
          <CommandList>
            <CommandEmpty>
              <div className="p-3 text-sm">
                Nenhum produto encontrado.
                <div className="mt-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleConfirmCustom}
                  >
                    <Type className="h-4 w-4 mr-1" />
                    Usar como avulso: “{query.trim()}”
                  </Button>
                </div>
              </div>
            </CommandEmpty>

            {query.trim() && (
              <CommandGroup heading="Ação rápida">
                <CommandItem
                  value={`custom:${query}`}
                  onSelect={() => handleConfirmCustom()}
                >
                  <Type className="h-4 w-4 mr-2" />
                  Usar como avulso: “{query.trim()}”
                </CommandItem>
              </CommandGroup>
            )}

            <CommandGroup heading="Produtos">
              {filtered.map((p) => (
                <CommandItem
                  key={p.id}
                  value={p.name}
                  onSelect={() => {
                    onPickProduct(p);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedProductId === p.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <PackagePlus className="mr-2 h-4 w-4 opacity-60" />
                  <div className="flex-1">
                    <div className="text-sm">{p.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {(p.unit_price_cents / 100).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
});
