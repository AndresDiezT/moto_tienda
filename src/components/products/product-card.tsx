import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

type Product = {
  id: string;
  name: string;
  price: number | string;
  stock: number;
  image: string | null;
};

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/tienda/${product.id}`}>
      <Card className="h-full overflow-hidden transition-colors hover:border-primary">
        <div className="aspect-square bg-muted">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              width={300}
              height={300}
              className="h-full w-full object-cover"
              unoptimized
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
              Sin imagen
            </div>
          )}
        </div>
        <CardContent className="flex flex-col gap-1 p-4">
          <p className="text-sm font-medium">{product.name}</p>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              ${Number(product.price).toLocaleString("es-CO")}
            </p>
            {product.stock === 0 && <Badge variant="destructive">Agotado</Badge>}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
