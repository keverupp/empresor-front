// src/components/ui/ImageUploader.tsx
"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useApi } from "@/hooks/useApi";
import { Button } from "./button";
import { Loader2, Upload, X } from "lucide-react";

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

  const isPaid = activePlan !== "free";

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !isPaid) return;

    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // 1. Get presigned URL from backend
        const { data: presignedData, error: presignedError } = await post(
          "/upload/presigned-url",
          {
            fileName: file.name,
            fileType: file.type,
          }
        );

        if (presignedError) {
          console.error("Error getting presigned URL", presignedError);
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
  };

  const handleRemove = (url: string) => {
    onChange(value.filter((u) => u !== url));
  };

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
    <div>
      <div className="grid grid-cols-3 gap-2">
        {value.map((url) => (
          <div key={url} className="relative">
            <img
              src={url}
              alt="Uploaded image"
              className="w-full h-24 object-cover rounded-md"
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
        <label className="flex items-center justify-center w-full h-24 border-2 border-dashed rounded-md cursor-pointer">
          <input
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
            disabled={disabled || uploading}
          />
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <Upload className="h-6 w-6 text-muted-foreground" />
          )}
        </label>
      </div>
    </div>
  );
}
