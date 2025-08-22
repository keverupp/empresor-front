// src/components/products/ProductDeleteDialog.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useApi } from "@/hooks/useApi";
import type { Product } from "@/types/product";
import { toast } from "sonner";

interface ProductDeleteDialogProps {
  companyId: string;
  product: Product;
  onDeleted?: (id: string) => void;
  children: React.ReactNode;
}

export function ProductDeleteDialog({
  companyId,
  product,
  onDeleted,
  children,
}: ProductDeleteDialogProps) {
  const { delete: deleteApi } = useApi();
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    const { error } = await deleteApi(
      `/companies/${companyId}/products/${product.id}`
    );
    if (!error) {
      toast.success("Produto excluído com sucesso");
      onDeleted?.(product.id);
      setOpen(false);
    }
    setIsDeleting(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir produto</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir &quot;{product.name}&quot;? Esta ação não pode
            ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Excluindo..." : "Excluir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ProductDeleteDialog;
