import "server-only";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { Prisma } from "@/generated/prisma/client";
import type { InvoiceSeries } from "@/generated/prisma/enums";

const SERIES_PREFIX: Record<InvoiceSeries, string> = {
  store: "FT",
  service: "FS",
};

// Decisión de Fase 3 (antes "pendiente de definir" en
// docs/ARCHITECTURE/modelo-de-datos.md): cada serie tiene su propio
// consecutivo. Debe correr dentro de la misma transacción que crea la
// Invoice — el conteo no usa un lock explícito, aceptable para el volumen
// de una demo, no para producción real.
export async function getNextInvoiceNumber(tx: Prisma.TransactionClient, series: InvoiceSeries) {
  const count = await tx.invoice.count({ where: { series } });
  return `${SERIES_PREFIX[series]}-${String(count + 1).padStart(6, "0")}`;
}

// "PDF simple" (HU-05.1/05.2) — generado al vuelo en GET /api/invoices/:id/pdf,
// no se persiste en storage (ver docs/CONTRACTS-API/facturas.md).
async function createInvoicePage(number: string, issuedAt: Date) {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]); // A4
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  let y = 780;
  function draw(text: string, options: { size?: number; useBold?: boolean } = {}) {
    page.drawText(text, {
      x: 50,
      y,
      size: options.size ?? 11,
      font: options.useBold ? bold : font,
      color: rgb(0, 0, 0),
    });
    y -= (options.size ?? 11) + 10;
  }

  draw("MiMotoTienda", { size: 20, useBold: true });
  draw("Factura simulada — sin validez fiscal (demo)", { size: 10 });
  y -= 10;
  draw(`Factura N.º: ${number}`, { useBold: true });
  draw(`Fecha de emisión: ${issuedAt.toLocaleString("es-CO", { dateStyle: "long", timeStyle: "short" })}`);
  y -= 10;

  return { doc, draw, addSpacing: () => (y -= 10) };
}

type ServiceInvoiceData = {
  number: string;
  issuedAt: Date;
  customerName: string;
  vehicleLabel: string;
  problemDescription: string;
  amount: number;
};

export async function renderServiceInvoicePdf(data: ServiceInvoiceData): Promise<Uint8Array> {
  const { doc, draw, addSpacing } = await createInvoicePage(data.number, data.issuedAt);

  draw(`Cliente: ${data.customerName}`);
  draw(`Vehículo: ${data.vehicleLabel}`);
  addSpacing();
  draw("Descripción del servicio:", { useBold: true });
  draw(data.problemDescription);
  addSpacing();
  draw(`Total pagado: $${data.amount.toLocaleString("es-CO")} COP`, { size: 14, useBold: true });

  return doc.save();
}

type StoreInvoiceData = {
  number: string;
  issuedAt: Date;
  customerName: string;
  deliveryMethod: "pickup" | "delivery";
  items: { name: string; quantity: number; unitPrice: number }[];
  shippingCost: number;
  total: number;
};

export async function renderStoreInvoicePdf(data: StoreInvoiceData): Promise<Uint8Array> {
  const { doc, draw, addSpacing } = await createInvoicePage(data.number, data.issuedAt);

  draw(`Cliente: ${data.customerName}`);
  draw(`Entrega: ${data.deliveryMethod === "delivery" ? "Envío a domicilio" : "Retiro en tienda"}`);
  addSpacing();
  draw("Productos:", { useBold: true });
  for (const item of data.items) {
    draw(
      `${item.quantity} x ${item.name} — $${item.unitPrice.toLocaleString("es-CO")} c/u = $${(item.quantity * item.unitPrice).toLocaleString("es-CO")}`
    );
  }
  if (data.shippingCost > 0) {
    draw(`Envío: $${data.shippingCost.toLocaleString("es-CO")}`);
  }
  addSpacing();
  draw(`Total: $${data.total.toLocaleString("es-CO")} COP`, { size: 14, useBold: true });

  return doc.save();
}
