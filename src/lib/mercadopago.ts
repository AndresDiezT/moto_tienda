import "server-only";
import { MercadoPagoConfig, Preference, Payment } from "mercadopago";

// ADR-0002 / ADR-0004: siempre modo sandbox en esta fase — el access token
// de prueba (TEST-...) ya hace que Mercado Pago trate todo como sandbox,
// no hay un "modo" separado que configurar.
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN ?? "",
});

export const mpPreference = new Preference(client);
export const mpPayment = new Payment(client);
