import { unauthorized, forbidden } from "next/navigation";
import { auth } from "@/auth";
import { canAccess } from "@/lib/roles";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const INVOICE_SERIES_LABELS: Record<string, string> = {
  store: "Compra en tienda",
  service: "Servicio de taller",
};

export default async function InvoicesPage() {
  const session = await auth();
  if (!session) unauthorized();
  if (!canAccess(session.user.role, ["customer"])) forbidden();

  const invoices = await prisma.invoice.findMany({
    where: {
      payment: {
        OR: [
          { order: { customerId: session.user.id } },
          { serviceOrder: { customerId: session.user.id } },
        ],
      },
    },
    include: { payment: { select: { amount: true } } },
    orderBy: { issuedAt: "desc" },
  });

  return (
    <main className="flex-1 py-12">
      <Container className="max-w-2xl">
        <h1 className="mb-6 text-xl font-semibold">Mis facturas</h1>
        <Card>
          <CardHeader>
            <CardTitle>{invoices.length} facturas</CardTitle>
          </CardHeader>
          <CardContent>
            {invoices.length === 0 ? (
              <p className="text-sm text-muted-foreground">Todavía no tienes facturas.</p>
            ) : (
              <ul className="flex flex-col divide-y divide-border">
                {invoices.map((invoice) => (
                  <li key={invoice.id} className="flex items-center justify-between gap-4 py-3">
                    <div>
                      <p className="text-sm font-medium">{invoice.number}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(invoice.issuedAt).toLocaleDateString("es-CO", { dateStyle: "medium" })} —
                        ${Number(invoice.payment.amount).toLocaleString("es-CO")}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={invoice.series === "store" ? "primary" : "default"}>
                        {INVOICE_SERIES_LABELS[invoice.series] ?? invoice.series}
                      </Badge>
                      <a
                        href={`/api/invoices/${invoice.id}/pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={buttonVariants({ variant: "outline", size: "sm" })}
                      >
                        Descargar PDF
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </Container>
    </main>
  );
}
