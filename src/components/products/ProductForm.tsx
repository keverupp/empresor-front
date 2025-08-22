// src/components/products/ProductForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

const productSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  sku: z.string().optional(),
  unit_price: z.coerce.number().nonnegative(),
  unit: z.string().optional(),
  is_active: z.boolean().default(true),
});

export type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  defaultValues?: Partial<ProductFormValues>;
  onSubmit: (values: ProductFormValues) => Promise<void>;
  isSubmitting: boolean;
}

export function ProductForm({ defaultValues, onSubmit, isSubmitting }: ProductFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      sku: "",
      unit_price: 0,
      unit: "",
      is_active: true,
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Nome</Label>
        <Input id="name" {...register("name")} />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="description">Descrição</Label>
        <Textarea id="description" {...register("description")} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="sku">SKU</Label>
          <Input id="sku" {...register("sku")} />
        </div>
        <div>
          <Label htmlFor="unit">Unidade</Label>
          <Input id="unit" {...register("unit")} />
        </div>
      </div>
      <div>
        <Label htmlFor="unit_price">Preço unitário</Label>
        <Input
          id="unit_price"
          type="number"
          step="0.01"
          {...register("unit_price", { valueAsNumber: true })}
        />
        {errors.unit_price && (
          <p className="text-sm text-destructive">
            {errors.unit_price.message}
          </p>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="is_active" {...register("is_active")} />
        <Label htmlFor="is_active">Ativo</Label>
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Salvando..." : "Salvar"}
      </Button>
    </form>
  );
}

export default ProductForm;
