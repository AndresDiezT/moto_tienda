import { forbidden, unauthorized } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ProductsManager } from "@/components/products/products-manager";
import { CategoriesManager } from "@/components/products/categories-manager";

export default async function ProductsPage() {
  const session = await auth();
  if (!session) unauthorized();
  if (session.user.role !== "admin") forbidden();

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      include: { category: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Productos</h1>
      <CategoriesManager initialCategories={categories} />
      <ProductsManager
        initialProducts={products.map((p) => ({
          id: p.id,
          name: p.name,
          price: Number(p.price),
          stock: p.stock,
          active: p.active,
          category: p.category,
        }))}
        categories={categories}
      />
    </div>
  );
}
