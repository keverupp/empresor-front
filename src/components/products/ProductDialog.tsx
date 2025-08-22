// src/components/products/ProductDialog.tsx
"use client";

import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { ProductForm, ProductFormValues } from "./ProductForm";
import { useApi } from "@/hooks/useApi";
import type { Product } from "@/types/product";
import { toast } from "sonner";

interface ProductDialogProps {
  companyId: string;
  product?: Product;
  trigger?: React.ReactNode;
  onSuccess?: (product: Product) => void;
}

export function ProductDialog({ companyId, product, trigger, onSuccess }: ProductDialogProps) {
  const { post, put } = useApi();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(
    async (values: ProductFormValues) => {
      setIsSubmitting(true);
      const payload = {
        name: values.name,
        description: values.description || null,
        sku: values.sku || null,
        unit_price_cents: Math.round(values.unit_price * 100),
        unit: values.unit || null,
        is_active: values.is_active,
      };

      try {
        const endpoint = product
          ? `/companies/${companyId}/products/${product.id}`
          : `/companies/${companyId}/products`;
        const method = product ? put : post;
        const { data, error } = await method<Product>(endpoint, payload);

        if (error) {
          return;
        }

        if (data) {
          toast.success(
            product ? "Produto atualizado com sucesso" : "Produto criado com sucesso"
          );
          onSuccess?.(data);
          setOpen(false);
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [companyId, post, put, product, onSuccess]
  );

  const defaultValues = product
    ? {
        name: product.name,
        description: product.description ?? "",
        sku: product.sku ?? "",
        unit_price: product.unit_price_cents / 100,
        unit: product.unit ?? "",
        is_active: product.is_active,
      }
    : undefined;

  return (
  <Dialog open={open} onOpenChange={setOpen}>
    {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>{product ? "Editar produto" : "Novo produto"}</DialogTitle>
        <DialogDescription>
          {product
            ? "Atualize as informações do produto."
            : "Preencha os dados para criar um novo produto."}
        </DialogDescription>
      </DialogHeader>
      <ProductForm
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </DialogContent>
  </Dialog>
  );
}

export default ProductDialog;
