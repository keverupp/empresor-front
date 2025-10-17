// src/components/ui/ImageUploader.tsx
"use client";

import {
  useCallback,
  useEffect,
  useState,
  type DragEvent,
} from "react";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useApi } from "@/hooks/useApi";
import { Button } from "./button";
import { Loader2, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

type PresignedUploadResponse = {
  uploadUrl: string;
  fileUrl: string;
};

type ImageUploaderProps = {
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
};

export function ImageUploader({
  value,
  onChange,
  disabled,
}: ImageUploaderProps) {
  const { activePlan } = useAuth();
  const { post } = useApi();
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const isPaid =
    !!activePlan &&
    ["active", "trialing"].includes(activePlan.status) &&
    activePlan.plan_name.toLowerCase() !== "gratuito";

  const handleUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0 || !isPaid) return;

      setUploading(true);
      try {
        const uploadPromises = Array.from(files).map(async (file) => {
          // 1. Get presigned URL from backend
          const { data: presignedData, error: presignedError } = await post<
            PresignedUploadResponse
          >("/upload/presigned-url", {
            fileName: file.name,
            fileType: file.type,
          });

          if (presignedError) {
            console.error("Error getting presigned URL", presignedError);
            return null;
          }

          if (!presignedData) {
            console.error("Missing presigned upload data");
            return null;
          }

          // 2. Upload to MinIO
          const { uploadUrl, fileUrl } = presignedData;
          const uploadResponse = await fetch(uploadUrl, {
            method: "PUT",
            body: file,
            headers: {
              "Content-Type": file.type,
            },
          });

          if (!uploadResponse.ok) {
            console.error("Error uploading to MinIO");
            return null;
          }

          return fileUrl;
        });

        const uploadedUrls = (await Promise.all(uploadPromises)).filter(
          (url) => url !== null
        ) as string[];
        onChange([...value, ...uploadedUrls]);
      } finally {
        setUploading(false);
      }
    },
    [isPaid, post, value, onChange]
  );

  const handleRemove = (url: string) => {
    onChange(value.filter((u) => u !== url));
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled || !isPaid) return;
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled || uploading || !isPaid) return;
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      void handleUpload(files);
    }
  };

  const handlePaste = useCallback(
    (e: globalThis.ClipboardEvent) => {
      if (disabled || uploading || !isPaid) return;
      const files = e.clipboardData?.files;
      if (files && files.length > 0) {
        const imageFiles = Array.from(files).filter((file) =>
          file.type.startsWith("image/")
        );
        if (imageFiles.length > 0) {
          e.preventDefault();
          e.stopPropagation();
          // O browser nos dá um FileList, mas nosso handler espera um FileList | null
          // Criamos um DataTransfer para gerar um FileList a partir dos arquivos filtrados
          const dataTransfer = new DataTransfer();
          imageFiles.forEach((file) => dataTransfer.items.add(file));
          void handleUpload(dataTransfer.files);
        }
      }
    },
    [disabled, uploading, isPaid, handleUpload]
  );

  useEffect(() => {
    document.addEventListener("paste", handlePaste);
    return () => {
      document.removeEventListener("paste", handlePaste);
    };
  }, [handlePaste]);

  if (!isPaid) {
    return (
      <div className="p-4 border-2 border-dashed rounded-md text-center">
        <p className="text-sm text-muted-foreground">
          O upload de imagens está disponível apenas para usuários do plano
          pago.
        </p>
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
    >
      <div className="grid grid-cols-3 gap-2">
        {value.map((url) => (
          <div key={url} className="relative">
            <Image
              src={url}
              alt="Uploaded image"
              className="w-full h-24 object-cover rounded-md"
              width={96}
              height={96}
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6"
              onClick={() => handleRemove(url)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <label
          className={cn(
            "flex items-center justify-center w-full h-24 border-2 border-dashed rounded-md cursor-pointer transition-colors",
            isDragging
              ? "border-primary bg-primary/10"
              : "border-input hover:border-primary/50",
            (disabled || uploading) && "cursor-not-allowed bg-muted/50"
          )}
        >
          <input
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
            disabled={disabled || uploading}
          />
          <div className="text-center">
            {uploading ? (
              <Loader2 className="h-6 w-6 animate-spin mx-auto" />
            ) : (
              <Upload className="h-6 w-6 text-muted-foreground mx-auto" />
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Arraste, cole ou clique para enviar
            </p>
          </div>
        </label>
      </div>
    </div>
  );
}
