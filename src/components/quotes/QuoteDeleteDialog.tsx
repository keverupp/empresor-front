"use client";

import { useId, useState } from "react";
import { CircleAlertIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Quote } from "@/types/apiInterfaces";

interface QuoteDeleteDialogProps {
  quote: Quote;
  onConfirm: () => Promise<boolean>;
  isLoading: boolean;
  children: React.ReactNode;
}

export function QuoteDeleteDialog({
  quote,
  onConfirm,
  isLoading,
  children,
}: QuoteDeleteDialogProps) {
  const id = useId();
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleConfirm = async () => {
    const success = await onConfirm();
    if (success) {
      setIsOpen(false);
      setInputValue("");
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setInputValue("");
    }
  };

  // Texto que o usuário precisa digitar para liberar a exclusão
  const confirmText = quote.quote_number;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <div className="flex flex-col items-center gap-2">
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-full border border-destructive text-destructive"
            aria-hidden="true"
          >
            <CircleAlertIcon className="opacity-80" size={16} />
          </div>
          <DialogHeader>
            <DialogTitle className="sm:text-center">
              Confirmar exclusão do orçamento
            </DialogTitle>
            <DialogDescription className="sm:text-center">
              Esta ação não pode ser desfeita. Para confirmar, digite o número
              do orçamento{" "}
              <span className="text-destructive font-semibold">
                {confirmText}
              </span>
              {quote.client?.name ? (
                <>
                  {" "}
                  (cliente:{" "}
                  <span className="font-medium">{quote.client.name}</span>)
                </>
              ) : null}
              .
            </DialogDescription>
          </DialogHeader>
        </div>

        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          <div className="*:not-first:mt-2">
            <Label htmlFor={id}>
              Para confirmar, digite o número do orçamento:
            </Label>
            <Input
              id={id}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
              placeholder={confirmText}
            />
          </div>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                disabled={isLoading}
              >
                Cancelar
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              className="flex-1"
              disabled={inputValue !== confirmText || isLoading}
              onClick={handleConfirm}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Excluir orçamento
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
