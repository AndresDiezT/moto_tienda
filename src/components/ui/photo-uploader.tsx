"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

// Sube directo a Supabase Storage vía el flujo de signed URL de
// docs/CONTRACTS-API/archivos.md: pide la URL firmada a nuestro backend,
// hace PUT del archivo ahí, y guarda la publicUrl resultante.
export function PhotoUploader({
  purpose,
  photos,
  onChange,
}: {
  purpose: "product-image" | "service-order-photo";
  photos: string[];
  onChange: (photos: string[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const signRes = await fetch("/api/uploads/sign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ purpose, contentType: file.type }),
        });
        if (!signRes.ok) {
          setError("No se pudo iniciar la subida de la foto.");
          continue;
        }
        const { uploadUrl, publicUrl } = (await signRes.json()) as {
          uploadUrl: string;
          publicUrl: string;
        };

        const putRes = await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });
        if (!putRes.ok) {
          setError("No se pudo subir una de las fotos.");
          continue;
        }
        uploaded.push(publicUrl);
      }
      onChange([...photos, ...uploaded]);
    } finally {
      setUploading(false);
    }
  }

  function removePhoto(url: string) {
    onChange(photos.filter((p) => p !== url));
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        disabled={uploading}
        onChange={(e) => handleFiles(e.target.files)}
        className="text-sm text-muted-foreground file:mr-3 file:rounded-md file:border file:border-border file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-secondary-foreground"
      />
      {uploading && <p className="text-xs text-muted-foreground">Subiendo...</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
      {photos.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {photos.map((url) => (
            <div key={url} className="relative">
              <Image
                src={url}
                alt="Foto subida"
                width={80}
                height={80}
                className="h-20 w-20 rounded-md border border-border object-cover"
                unoptimized
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => removePhoto(url)}
                className="absolute -right-2 -top-2 h-6 w-6 rounded-full p-0"
                aria-label="Quitar foto"
              >
                <X size={12} />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
