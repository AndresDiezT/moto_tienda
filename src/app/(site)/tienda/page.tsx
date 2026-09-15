import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/container";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/products/product-card";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function CatalogPage({ searchParams }: Props) {
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search : "";
  const category = typeof params.category === "string" ? params.category : "";

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: {
        active: true,
        ...(category ? { categoryId: category } : {}),
        ...(search ? { name: { contains: search, mode: "insensitive" as const } } : {}),
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <main className="flex-1 py-12">
      <Container>
        <h1 className="mb-6 text-xl font-semibold">Catálogo</h1>
        <form className="mb-8 flex flex-wrap gap-2">
          <Input
            name="search"
            defaultValue={search}
            placeholder="Buscar productos..."
            className="max-w-xs"
          />
          <Select name="category" defaultValue={category} className="max-w-xs">
            <option value="">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          <Button type="submit" variant="outline">
            Filtrar
          </Button>
        </form>

        {products.length === 0 ? (
          <p className="text-sm text-muted-foreground">No se encontraron productos.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  id: product.id,
                  name: product.name,
                  price: Number(product.price),
                  stock: product.stock,
                  image: product.images[0] ?? null,
                }}
              />
            ))}
          </div>
        )}
      </Container>
    </main>
  );
}
