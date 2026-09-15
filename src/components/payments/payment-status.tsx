import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  approved: "Aprobado",
  rejected: "Rechazado",
  cancelled: "Cancelado",
};

const PAYMENT_PROVIDER_LABELS: Record<string, string> = {
  mercadopago: "Mercado Pago",
  cash: "Pago en el taller",
};

type PaymentWithInvoice = {
  id: string;
  status: string;
  provider: string;
  amount: number | string;
  createdAt: Date | string;
  invoice: { id: string } | null;
};

export function PaymentStatus({ payments }: { payments: PaymentWithInvoice[] }) {
  if (payments.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pagos</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {payments.map((payment) => (
          <div key={payment.id} className="flex items-center justify-between gap-3 text-sm">
            <span>
              ${Number(payment.amount).toLocaleString("es-CO")} COP —{" "}
              {PAYMENT_PROVIDER_LABELS[payment.provider] ?? payment.provider} —{" "}
              {new Date(payment.createdAt).toLocaleDateString("es-CO", { dateStyle: "medium" })}
            </span>
            <div className="flex items-center gap-2">
              <Badge variant={payment.status === "approved" ? "success" : "default"}>
                {PAYMENT_STATUS_LABELS[payment.status] ?? payment.status}
              </Badge>
              {payment.invoice && (
                <a
                  href={`/api/invoices/${payment.invoice.id}/pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  Ver factura
                </a>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
