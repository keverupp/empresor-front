// src/components/quotes/edit/ItemsTab.tsx
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Loader2,
  Plus,
  Check,
  X,
  AlertCircle,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWatch, type UseFormReturn } from "react-hook-form";
import type { QuoteFormData } from "@/lib/quote-schemas";
import type { Product } from "@/types/apiInterfaces";
import { ProductOrDescriptionCombobox } from "@/components/quotes/edit/ProductOrDescriptionCombobox";
import { ImageUploader } from "@/components/ui/ImageUploader";

type Props = {
  form: UseFormReturn<QuoteFormData>;
  hasCatalog: boolean;
  products: Product[];
  onAdd: (p: {
    description: string;
    quantity: number;
    unit_price: number;
    product_id?: string | null;
    complement?: string;
    images?: string[];
  }) => Promise<void>;
  onUpdate: (
    itemId: number,
    patch: {
      description?: string;
      quantity?: number;
      unit_price?: number;
      product_id?: string | null;
      complement?: string;
      images?: string[];
    }
  ) => Promise<void>;
  onRemove: (itemId: number) => Promise<void>;
};

type FormItem = QuoteFormData["items"][number] & { id?: number };

export function ItemsTab({
  form,
  hasCatalog,
  products,
  onAdd,
  onUpdate,
  onRemove,
}: Props) {
  const rawItems = useWatch({ control: form.control, name: "items" }) as
    | FormItem[]
    | undefined;
  const items = useMemo(() => rawItems ?? [], [rawItems]);

  // ---------- Linha de adição ----------
  const [addDesc, setAddDesc] = useState("");
  const [addQty, setAddQty] = useState<number>(1);
  const [addPrice, setAddPrice] = useState<number>(0);
  const [addProductId, setAddProductId] = useState<string | undefined>();
  const [addComplement, setAddComplement] = useState("");
  const [addImages, setAddImages] = useState<string[]>([]);
  const [adding, setAdding] = useState(false);
  const [addFormErrors, setAddFormErrors] = useState<{
    description?: string;
    quantity?: string;
    price?: string;
  }>({});

  const refDesc = useRef<HTMLInputElement>(null);
  const refProduct = useRef<{ focus: () => void }>(null);
  const refQty = useRef<HTMLInputElement>(null);
  const refPrice = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (hasCatalog) refProduct.current?.focus();
    else refDesc.current?.focus();
  }, [hasCatalog]);

  const isAddFormValid =
    addDesc.trim().length > 0 && addQty > 0 && addPrice >= 0;

  const validateAddForm = useCallback(() => {
    const errors: typeof addFormErrors = {};
    if (!addDesc.trim()) errors.description = "Descrição é obrigatória";
    if (addQty <= 0) errors.quantity = "Quantidade deve ser maior que zero";
    if (addPrice < 0) errors.price = "Preço não pode ser negativo";
    setAddFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [addDesc, addQty, addPrice]);

  const resetAddForm = useCallback(() => {
    setAddDesc("");
    setAddQty(1);
    setAddPrice(0);
    setAddProductId(undefined);
    setAddComplement("");
    setAddImages([]);
    setAddFormErrors({});
  }, []);

  const handleAddSubmit = useCallback(async () => {
    if (!validateAddForm()) return;
    setAdding(true);
    try {
      await onAdd({
        description: addDesc.trim(),
        quantity: addQty,
        unit_price: addPrice,
        product_id: addProductId ?? null,
        complement: addComplement,
        images: addImages,
      });
      resetAddForm();
      if (hasCatalog) refProduct.current?.focus();
      else refDesc.current?.focus();
    } finally {
      setAdding(false);
    }
  }, [
    validateAddForm,
    onAdd,
    addDesc,
    addQty,
    addPrice,
    addProductId,
    addComplement,
    addImages,
    resetAddForm,
    hasCatalog,
  ]);

  const handleAddKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>, field: "desc" | "qty" | "price") => {
      if (e.key === "Escape") {
        resetAddForm();
        return;
      }
      if (e.key !== "Enter") return;
      e.preventDefault();
      if (field === "desc") refQty.current?.focus();
      else if (field === "qty") refPrice.current?.focus();
      else if (field === "price") void handleAddSubmit();
    },
    [handleAddSubmit, resetAddForm]
  );

  // ---------- Edição ----------
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [buf, setBuf] = useState<{
    desc: string;
    qty: number;
    price: number;
    product_id?: string | null;
    complement: string;
    images: string[];
  }>({
    desc: "",
    qty: 1,
    price: 0,
    product_id: null,
    complement: "",
    images: [],
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [editErrors, setEditErrors] = useState<{
    description?: string;
    quantity?: string;
    price?: string;
  }>({});

  const startEdit = useCallback(
    (idx: number) => {
      const it = items[idx];
      if (!it) return;
      setEditingRow(idx);
      setBuf({
        desc: it.description || "",
        qty: Number(it.quantity) || 1,
        price: Number(it.unit_price) || 0,
        product_id: it.product_id ?? null,
        complement: it.complement || "",
        images: it.images || [],
      });
      setEditErrors({});
    },
    [items]
  );

  const validateEditForm = useCallback(() => {
    const errors: typeof editErrors = {};
    if (!buf.desc.trim()) errors.description = "Descrição é obrigatória";
    if (buf.qty <= 0) errors.quantity = "Quantidade deve ser maior que zero";
    if (buf.price < 0) errors.price = "Preço não pode ser negativo";
    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  }, [buf]);

  const confirmEdit = useCallback(async () => {
    const idx = editingRow;
    if (idx == null) return;
    const it = items[idx] as FormItem | undefined;
    if (!it || !it.id) return;

    if (!validateEditForm()) return;

    setSavingEdit(true);
    try {
      await onUpdate(it.id, {
        description: buf.desc.trim(),
        quantity: buf.qty,
        unit_price: buf.price,
        product_id: hasCatalog ? buf.product_id ?? null : undefined,
        complement: buf.complement,
        images: buf.images,
      });
      setEditingRow(null);
      setEditErrors({});
    } finally {
      setSavingEdit(false);
    }
  }, [editingRow, items, validateEditForm, onUpdate, buf, hasCatalog]);

  const cancelEdit = useCallback(() => {
    setEditingRow(null);
    setEditErrors({});
  }, []);

  // Totais
  const grandTotal = useMemo(() => {
    const total =
      items.reduce(
        (sum, item) =>
          sum + Number(item.quantity) * Number(item.unit_price || 0),
        0
      ) || 0;
    return total.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }, [items]);

  const calcLineTotal = useCallback((quantity: number, price: number) => {
    return (quantity * price).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }, []);

  return (
    <div className="space-y-6">
      {/* Header com resumo */}
      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">Itens do Orçamento</span>
          </div>
          <Badge variant="secondary" aria-label="Quantidade de itens">
            {items.length} {items.length === 1 ? "item" : "itens"}
          </Badge>
        </div>
        {items.length > 0 && (
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total Geral</p>
            <p className="text-lg font-semibold">{grandTotal}</p>
          </div>
        )}
      </div>

      {/* Formulário de adição */}
      <div className="p-4 border-2 border-dashed border-muted-foreground/25 rounded-lg bg-background">
        <div className="flex items-center gap-2 mb-4">
          <Plus className="h-4 w-4" />
          <span className="font-medium">Adicionar Itens</span>
        </div>

        <div className="space-y-4">
          <div
            className={cn(
              "grid grid-cols-1 gap-4",
              hasCatalog && products.length > 0
                ? "sm:grid-cols-12"
                : "sm:grid-cols-9"
            )}
          >
            {/* Produto ou descrição */}
            {hasCatalog && products.length > 0 ? (
              <div className="sm:col-span-7 space-y-1">
                <Label className="text-sm font-medium">Produto</Label>
                <ProductOrDescriptionCombobox
                  ref={refProduct}
                  products={products}
                  description={addDesc}
                  selectedProductId={addProductId}
                  onPickProduct={(p) => {
                    setAddProductId(p.id);
                    setAddDesc(p.name);
                    if (!addPrice) setAddPrice(p.unit_price_cents / 100);
                    refQty.current?.focus();
                  }}
                  onPickCustom={(desc) => {
                    setAddProductId(undefined);
                    setAddDesc(desc);
                    refQty.current?.focus();
                  }}
                  inputId="add-desc-combobox"
                />
                {addFormErrors.description && (
                  <div className="flex items-center gap-1 text-xs text-destructive">
                    <AlertCircle className="h-3 w-3" />
                    {addFormErrors.description}
                  </div>
                )}
              </div>
            ) : (
              <div className="sm:col-span-4 space-y-1">
                <Label htmlFor="add-desc" className="text-sm font-medium">
                  Descrição
                </Label>
                <Input
                  id="add-desc"
                  ref={refDesc}
                  value={addDesc}
                  onChange={(e) => {
                    setAddDesc(e.target.value);
                    if (addFormErrors.description) {
                      setAddFormErrors((prev) => ({
                        ...prev,
                        description: undefined,
                      }));
                    }
                  }}
                  onKeyDown={(e) => handleAddKeyDown(e, "desc")}
                  placeholder="Descrição do item"
                  aria-invalid={!!addFormErrors.description}
                  className={cn(
                    addFormErrors.description && "border-destructive"
                  )}
                />
                {addFormErrors.description && (
                  <div className="flex items-center gap-1 text-xs text-destructive">
                    <AlertCircle className="h-3 w-3" />
                    {addFormErrors.description}
                  </div>
                )}
              </div>
            )}

            <div className="sm:col-span-2 space-y-1">
              <Label htmlFor="add-qty" className="text-sm font-medium">
                Quantidade
              </Label>
              <Input
                id="add-qty"
                ref={refQty}
                type="number"
                min="0.01"
                step="0.01"
                value={Number.isFinite(addQty) ? addQty : 0}
                onChange={(e) => {
                  setAddQty(parseFloat(e.target.value || "0"));
                  if (addFormErrors.quantity) {
                    setAddFormErrors((prev) => ({
                      ...prev,
                      quantity: undefined,
                    }));
                  }
                }}
                onKeyDown={(e) => handleAddKeyDown(e, "qty")}
                aria-invalid={!!addFormErrors.quantity}
                className={cn(addFormErrors.quantity && "border-destructive")}
              />
              {addFormErrors.quantity && (
                <div className="flex items-center gap-1 text-xs text-destructive">
                  <AlertCircle className="h-3 w-3" />
                  {addFormErrors.quantity}
                </div>
              )}
            </div>

            <div className="sm:col-span-2 space-y-1">
              <Label htmlFor="add-price" className="text-sm font-medium">
                Preço
              </Label>
              <Input
                id="add-price"
                ref={refPrice}
                type="number"
                min="0"
                step="0.01"
                value={Number.isFinite(addPrice) ? addPrice : 0}
                onChange={(e) => {
                  setAddPrice(parseFloat(e.target.value || "0"));
                  if (addFormErrors.price) {
                    setAddFormErrors((prev) => ({ ...prev, price: undefined }));
                  }
                }}
                onKeyDown={(e) => handleAddKeyDown(e, "price")}
                aria-invalid={!!addFormErrors.price}
                className={cn(addFormErrors.price && "border-destructive")}
              />
              {addFormErrors.price && (
                <div className="flex items-center gap-1 text-xs text-destructive">
                  <AlertCircle className="h-3 w-3" />
                  {addFormErrors.price}
                </div>
              )}
            </div>

            <div className="sm:col-span-1 flex items-end">
              <Button
                className="w-full"
                type="button"
                onClick={handleAddSubmit}
                disabled={adding || !isAddFormValid}
                aria-label="Adicionar item"
              >
                {adding ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="add-complement" className="text-sm font-medium">
              Complemento (Opcional)
            </Label>
            <Textarea
              id="add-complement"
              value={addComplement}
              onChange={(e) => setAddComplement(e.target.value)}
              placeholder="Detalhes adicionais, observações, etc."
              rows={2}
              className="mt-1"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-sm font-medium">Imagens (Opcional)</Label>
            <ImageUploader
              value={addImages}
              onChange={setAddImages}
            />
          </div>
        </div>

        {/* Preview do item sendo adicionado */}
        {addDesc && addQty > 0 && addPrice >= 0 && (
          <div className="mt-3 p-3 bg-muted/50 rounded border">
            <div className="text-xs text-muted-foreground mb-1">Preview:</div>
            <div className="text-sm">
              <span className="font-medium">{addDesc}</span> — {addQty} ×{" "}
              {addPrice.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}{" "}
              ={" "}
              <span className="font-semibold">
                {(addQty * addPrice).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Tabela de itens (zebrada) */}
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold">Descrição</TableHead>
              <TableHead className="w-[110px] font-semibold">Qtd</TableHead>
              <TableHead className="w-[130px] font-semibold">
                Preço Unit.
              </TableHead>
              <TableHead className="w-[130px] font-semibold">Total</TableHead>
              <TableHead className="w-[60px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground py-8"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Package className="h-8 w-8 text-muted-foreground/50" />
                    <p>Nenhum item adicionado ainda</p>
                    <p className="text-xs">
                      Use o formulário acima para adicionar itens ao orçamento
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              items.map((it, idx) => {
                const isEditing = editingRow === idx;
                const lineTotal =
                  Number(it.quantity) * Number(it.unit_price || 0);

                return (
                  <TableRow
                    key={it.id ?? `row-${idx}`}
                    className={cn(
                      "hover:bg-muted/30 transition-colors odd:bg-muted/20",
                      isEditing && "border-blue-200"
                    )}
                  >
                    <TableCell>
                      {isEditing ? (
                        <div className="space-y-2">
                          {hasCatalog ? (
                            <ProductOrDescriptionCombobox
                              products={products}
                              description={buf.desc}
                              selectedProductId={buf.product_id ?? undefined}
                              onPickProduct={(p) =>
                                setBuf((b) => ({
                                  ...b,
                                  product_id: p.id,
                                  desc: p.name,
                                  // Se quiser copiar o preço do catálogo:
                                  // price: p.unit_price_cents / 100,
                                }))
                              }
                              onPickCustom={(desc) =>
                                setBuf((b) => ({
                                  ...b,
                                  product_id: null,
                                  desc,
                                }))
                              }
                              confirmOnEnter={false}
                            />
                          ) : (
                            <Input
                              value={buf.desc}
                              onChange={(e) =>
                                setBuf((b) => ({ ...b, desc: e.target.value }))
                              }
                              className={cn(
                                editErrors.description && "border-destructive"
                              )}
                            />
                          )}
                          {editErrors.description && (
                            <div className="flex items-center gap-1 text-xs text-destructive">
                              <AlertCircle className="h-3 w-3" />
                              {editErrors.description}
                            </div>
                          )}
                          <div>
                            <Label
                              htmlFor={`edit-complement-${idx}`}
                              className="text-xs text-muted-foreground"
                            >
                              Complemento
                            </Label>
                            <Textarea
                              id={`edit-complement-${idx}`}
                              value={buf.complement}
                              onChange={(e) =>
                                setBuf((b) => ({
                                  ...b,
                                  complement: e.target.value,
                                }))
                              }
                              className="mt-1"
                              rows={2}
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">
                              Imagens
                            </Label>
                            <ImageUploader
                              value={buf.images}
                              onChange={(newImages) =>
                                setBuf((b) => ({ ...b, images: newImages }))
                              }
                            />
                          </div>
                        </div>
                      ) : (
                        <div>
                          <span
                            className="font-medium block"
                            title={it.description}
                          >
                            {it.description}
                          </span>
                          {it.complement && (
                            <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                              {it.complement}
                            </p>
                          )}
                          {it.images && it.images.length > 0 && (
                            <div className="mt-2 flex gap-2">
                              {it.images.map((img) => (
                                <img
                                  key={img}
                                  src={img}
                                  alt="imagem do item"
                                  className="h-10 w-10 rounded object-cover"
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </TableCell>

                    <TableCell>
                      {isEditing ? (
                        <div className="space-y-1">
                          <Input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={buf.qty}
                            onChange={(e) =>
                              setBuf((b) => ({
                                ...b,
                                qty: parseFloat(e.target.value || "0"),
                              }))
                            }
                            className={cn(
                              editErrors.quantity && "border-destructive"
                            )}
                          />
                          {editErrors.quantity && (
                            <div className="flex items-center gap-1 text-xs text-destructive">
                              <AlertCircle className="h-3 w-3" />
                              {editErrors.quantity}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="tabular-nums font-mono">
                          {it.quantity}
                        </span>
                      )}
                    </TableCell>

                    <TableCell>
                      {isEditing ? (
                        <div className="space-y-1">
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={buf.price}
                            onChange={(e) =>
                              setBuf((b) => ({
                                ...b,
                                price: parseFloat(e.target.value || "0"),
                              }))
                            }
                            className={cn(
                              editErrors.price && "border-destructive"
                            )}
                          />
                          {editErrors.price && (
                            <div className="flex items-center gap-1 text-xs text-destructive">
                              <AlertCircle className="h-3 w-3" />
                              {editErrors.price}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="tabular-nums font-mono">
                          {Number(it.unit_price || 0).toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </span>
                      )}
                    </TableCell>

                    <TableCell>
                      {isEditing ? (
                        <span className="tabular-nums font-mono text-muted-foreground">
                          {calcLineTotal(buf.qty, buf.price)}
                        </span>
                      ) : (
                        <span className="tabular-nums font-mono font-semibold">
                          {lineTotal.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </span>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      {isEditing ? (
                        <div className="flex justify-end gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={cancelEdit}
                            className="h-8 w-8 p-0"
                            title="Cancelar edição"
                            aria-label="Cancelar edição"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={confirmEdit}
                            disabled={savingEdit}
                            className="h-8 w-8 p-0"
                            title="Salvar alterações"
                            aria-label="Salvar alterações"
                          >
                            {savingEdit ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              aria-label="Abrir ações do item"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações do Item</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => startEdit(idx)}>
                              <Pencil className="h-4 w-4 mr-2" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onSelect={(e) => e.preventDefault()}
                              onClick={async () => {
                                const id = (it as FormItem).id;
                                if (!id) return;
                                await onRemove(id);
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {items.length === 0 && (
        <div className="text-center p-4 text-sm text-muted-foreground bg-muted/20 rounded-lg">
          💡 <strong>Dica:</strong> Use{" "}
          <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Tab</kbd> para
          navegar e{" "}
          <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Enter</kbd> para
          adicionar rapidamente.
        </div>
      )}
    </div>
  );
}
