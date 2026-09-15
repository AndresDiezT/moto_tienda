-- Regla 2 (docs/ARCHITECTURE/modelo-de-datos.md): Payment.order_id y
-- Payment.service_order_id son mutuamente excluyentes — exactamente uno de
-- los dos debe estar presente, nunca ambos ni ninguno. Prisma no expresa
-- CHECK constraints arbitrarios en el schema, así que se agrega a mano aquí.
ALTER TABLE "payments"
ADD CONSTRAINT "payments_order_xor_service_order_check"
CHECK (
  (
    ("order_id" IS NOT NULL)::int +
    ("service_order_id" IS NOT NULL)::int
  ) = 1
);
