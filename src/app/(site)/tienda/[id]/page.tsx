import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/container";
import { AddToCartForm } from "@/components/products/add-to-cart-form";

type Props = { params: Promise<{ id: string }> };

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });

  if (!product || !product.active) notFound();

  return (
    <main className="flex-1 py-12">
      <Container className="grid gap-8 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <div className="aspect-square overflow-hidden rounded-lg bg-muted">
            {product.images[0] ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                width={600}
                height={600}
                className="h-full w-full object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Sin imagen
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.slice(1).map((url) => (
                <Image
                  key={url}
                  src={url}
                  alt={product.name}
                  width={80}
                  height={80}
                  className="h-20 w-20 rounded-md object-cover"
                  unoptimized
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <p className="text-sm text-muted-foreground">{product.category.name}</p>
            <h1 className="text-2xl font-semibold">{product.name}</h1>
            <p className="mt-1 text-xl">${Number(product.price).toLocaleString("es-CO")}</p>
          </div>
          <p className="text-sm text-muted-foreground">{product.description}</p>
          <p className="text-sm text-muted-foreground">
            {product.stock > 0 ? `${product.stock} disponibles` : "Sin stock"}
          </p>
          <AddToCartForm
            product={{
              id: product.id,
              name: product.name,
              price: Number(product.price),
              stock: product.stock,
              images: product.images,
            }}
          />
        </div>
      </Container>
    </main>
  );
}
