import "dotenv/config";
import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { PrismaClient, type Prisma } from "../src/generated/prisma/client";
import type { ServiceOrderStatus, InvoiceSeries } from "../src/generated/prisma/enums";
import { PrismaPg } from "@prisma/adapter-pg";
import { FIXED_SHIPPING_COST } from "../src/lib/shipping";

// src/lib/passwords.ts y src/lib/invoices.ts están marcados "server-only"
// (solo importables desde el runtime de Next.js) — este script corre con
// tsx fuera de ese runtime, así que se reimplementan acá las dos piezas que
// necesita en vez de importarlas.
function hashPassword(plain: string) {
  return bcrypt.hash(plain, 10);
}

const INVOICE_SERIES_PREFIX: Record<InvoiceSeries, string> = { store: "FT", service: "FS" };

async function getNextInvoiceNumber(tx: Prisma.TransactionClient, series: InvoiceSeries) {
  const count = await tx.invoice.count({ where: { series } });
  return `${INVOICE_SERIES_PREFIX[series]}-${String(count + 1).padStart(6, "0")}`;
}

// Datos de ejemplo para la demo (Fase 6, docs/PLAN/plan-de-trabajo.md).
// Re-ejecutable: borra los datos de negocio generados por este script y
// los vuelve a crear, pero conserva/actualiza los usuarios (mismas
// credenciales siempre) para que el guion de demo no dependa de leer la
// base de datos antes de cada presentación — ver docs/PLAN/guion-demo.md.

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const DAY_MS = 24 * 60 * 60 * 1000;
const daysAgo = (n: number) => new Date(Date.now() - n * DAY_MS);

const SERVICE_ORDER_SEQUENCE: ServiceOrderStatus[] = [
  "received",
  "diagnosing",
  "quote_sent",
  "approved",
  "in_repair",
  "quality_check",
  "ready_for_pickup",
  "delivered",
];

const SERVICE_ORDER_EVENT_NOTES: Record<ServiceOrderStatus, string> = {
  received: "Vehículo recibido en el taller.",
  diagnosing: "Mecánico revisando el vehículo.",
  quote_sent: "Cotización enviada al cliente.",
  approved: "Cliente aprobó la cotización.",
  in_repair: "Reparación en curso.",
  quality_check: "Control de calidad en proceso.",
  ready_for_pickup: "Vehículo listo para entrega.",
  delivered: "Vehículo entregado al cliente.",
};

async function resetBusinessData() {
  // Orden inverso a las dependencias FK. Los usuarios no se tocan.
  await prisma.serviceOrderEvent.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.serviceOrder.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.address.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
}

async function seedUsers() {
  const password = await hashPassword("Demo12345");
  const adminPassword = await hashPassword("Admin12345");
  const mechanicPassword = await hashPassword("Mecanico123");

  const [admin, mechanicUno, mechanicDos, clienteDemo, clienteDos] = await Promise.all([
    prisma.user.upsert({
      where: { email: "admin.demo@example.com" },
      update: { name: "Admin Demo", phone: "3000000001", role: "admin", passwordHash: adminPassword },
      create: {
        email: "admin.demo@example.com",
        name: "Admin Demo",
        phone: "3000000001",
        role: "admin",
        passwordHash: adminPassword,
      },
    }),
    prisma.user.upsert({
      where: { email: "mecanico.uno@example.com" },
      update: { name: "Mecánico Uno", phone: "3000000002", role: "mechanic", passwordHash: mechanicPassword },
      create: {
        email: "mecanico.uno@example.com",
        name: "Mecánico Uno",
        phone: "3000000002",
        role: "mechanic",
        passwordHash: mechanicPassword,
      },
    }),
    prisma.user.upsert({
      where: { email: "mecanico.dos@example.com" },
      update: { name: "Mecánico Dos", phone: "3000000003", role: "mechanic", passwordHash: mechanicPassword },
      create: {
        email: "mecanico.dos@example.com",
        name: "Mecánico Dos",
        phone: "3000000003",
        role: "mechanic",
        passwordHash: mechanicPassword,
      },
    }),
    prisma.user.upsert({
      where: { email: "cliente.demo@example.com" },
      update: { name: "Cliente Demo", phone: "3000000004", role: "customer", passwordHash: password },
      create: {
        email: "cliente.demo@example.com",
        name: "Cliente Demo",
        phone: "3000000004",
        role: "customer",
        passwordHash: password,
      },
    }),
    prisma.user.upsert({
      where: { email: "cliente.dos@example.com" },
      update: { name: "Cliente Dos", phone: "3000000005", role: "customer", passwordHash: password },
      create: {
        email: "cliente.dos@example.com",
        name: "Cliente Dos",
        phone: "3000000005",
        role: "customer",
        passwordHash: password,
      },
    }),
  ]);

  return { admin, mechanicUno, mechanicDos, clienteDemo, clienteDos };
}

async function seedCatalog() {
  const [repuestos, accesorios, lubricantes] = await Promise.all([
    prisma.category.create({ data: { name: "Repuestos" } }),
    prisma.category.create({ data: { name: "Accesorios" } }),
    prisma.category.create({ data: { name: "Lubricantes y cuidado" } }),
  ]);

  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: "Kit de arrastre (piñón, corona, cadena)",
        description: "Kit completo de transmisión para motos de 150-250cc.",
        price: 280000,
        stock: 6,
        categoryId: repuestos.id,
        images: [],
      },
    }),
    prisma.product.create({
      data: {
        name: "Pastillas de freno delanteras",
        description: "Juego de pastillas de freno de disco, alto rendimiento.",
        price: 45000,
        stock: 19,
        categoryId: repuestos.id,
        images: [],
      },
    }),
    prisma.product.create({
      data: {
        name: "Batería 12V sellada",
        description: "Batería libre de mantenimiento, 12V, para motos de hasta 250cc.",
        price: 180000,
        stock: 3,
        categoryId: repuestos.id,
        images: [],
      },
    }),
    prisma.product.create({
      data: {
        name: "Casco MT integral",
        description: "Casco integral certificado, talla M.",
        price: 250000,
        stock: 8,
        categoryId: accesorios.id,
        images: [],
      },
    }),
    prisma.product.create({
      data: {
        name: "Guantes de protección",
        description: "Guantes con protección en nudillos, varias tallas.",
        price: 65000,
        stock: 14,
        categoryId: accesorios.id,
        images: [],
      },
    }),
    prisma.product.create({
      data: {
        name: "Maletero trasero 32L",
        description: "Maletero rígido con dos llaves, 32 litros de capacidad.",
        price: 195000,
        stock: 0,
        categoryId: accesorios.id,
        images: [],
      },
    }),
    prisma.product.create({
      data: {
        name: "Aceite de motor 20W50 (1L)",
        description: "Aceite mineral para motor 4 tiempos.",
        price: 38000,
        stock: 30,
        categoryId: lubricantes.id,
        images: [],
      },
    }),
    prisma.product.create({
      data: {
        name: "Kit de limpieza y lubricación de cadena",
        description: "Limpiador + lubricante en spray para cadena de transmisión.",
        price: 52000,
        stock: 12,
        categoryId: lubricantes.id,
        images: [],
      },
    }),
    prisma.product.create({
      data: {
        name: "Líquido de frenos DOT4",
        description: "Líquido de frenos sintético DOT4, 355ml.",
        price: 28000,
        stock: 17,
        categoryId: lubricantes.id,
        images: [],
      },
    }),
  ]);

  return { products };
}

async function seedVehicles(clienteDemo: { id: string }, clienteDos: { id: string }) {
  const [yamaha, honda, suzuki, bajaj] = await Promise.all([
    prisma.vehicle.create({
      data: { ownerId: clienteDemo.id, brand: "Yamaha", model: "FZ 2.0", year: 2022, plate: "ABC123" },
    }),
    prisma.vehicle.create({
      data: { ownerId: clienteDemo.id, brand: "Honda", model: "CB190R", year: 2023, plate: "XYZ789" },
    }),
    prisma.vehicle.create({
      data: { ownerId: clienteDos.id, brand: "Suzuki", model: "Gixxer SF250", year: 2021, plate: "DEF456" },
    }),
    prisma.vehicle.create({
      data: { ownerId: clienteDos.id, brand: "Bajaj", model: "Pulsar NS200", year: 2020, plate: "GHI321" },
    }),
  ]);

  return { yamaha, honda, suzuki, bajaj };
}

type ServiceOrderPlan = {
  vehicleId: string;
  customerId: string;
  mechanicId: string;
  problemDescription: string;
  status: ServiceOrderStatus;
  quoteStatus: "pending" | "approved" | null;
  estimatedCost: number | null;
  createdAt: Date;
  paid: boolean;
};

async function seedServiceOrder(plan: ServiceOrderPlan) {
  const order = await prisma.serviceOrder.create({
    data: {
      vehicleId: plan.vehicleId,
      customerId: plan.customerId,
      mechanicId: plan.mechanicId,
      problemDescription: plan.problemDescription,
      status: plan.status,
      quoteStatus: plan.quoteStatus,
      estimatedCost: plan.estimatedCost,
      finalCost: plan.paid ? plan.estimatedCost : null,
      createdAt: plan.createdAt,
    },
  });

  const upToIndex = SERVICE_ORDER_SEQUENCE.indexOf(plan.status);
  const eventStatuses = SERVICE_ORDER_SEQUENCE.slice(0, upToIndex + 1);
  for (const [index, status] of eventStatuses.entries()) {
    const authorId = status === "approved" ? plan.customerId : plan.mechanicId;
    await prisma.serviceOrderEvent.create({
      data: {
        serviceOrderId: order.id,
        status,
        note: SERVICE_ORDER_EVENT_NOTES[status],
        photos: [],
        authorId,
        createdAt: new Date(plan.createdAt.getTime() + index * 6 * 60 * 60 * 1000),
      },
    });
  }

  if (plan.paid && plan.estimatedCost) {
    await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          provider: "mercadopago",
          status: "approved",
          amount: plan.estimatedCost!,
          serviceOrderId: order.id,
        },
      });
      const number = await getNextInvoiceNumber(tx, "service");
      const invoiceId = randomUUID();
      await tx.invoice.create({
        data: {
          id: invoiceId,
          paymentId: payment.id,
          number,
          series: "service",
          pdfUrl: `/api/invoices/${invoiceId}/pdf`,
        },
      });
    });
  }

  return order;
}

async function seedServiceOrders(
  vehicles: Awaited<ReturnType<typeof seedVehicles>>,
  users: Awaited<ReturnType<typeof seedUsers>>
) {
  const { yamaha, honda, suzuki, bajaj } = vehicles;
  const { mechanicUno, mechanicDos, clienteDemo, clienteDos } = users;

  await seedServiceOrder({
    vehicleId: yamaha.id,
    customerId: clienteDemo.id,
    mechanicId: mechanicUno.id,
    problemDescription: "Cambio de aceite y revisión general de 10.000km.",
    status: "delivered",
    quoteStatus: "approved",
    estimatedCost: 120000,
    createdAt: daysAgo(10),
    paid: true,
  });

  await seedServiceOrder({
    vehicleId: yamaha.id,
    customerId: clienteDemo.id,
    mechanicId: mechanicUno.id,
    problemDescription: "Ruido en el motor al acelerar, posible problema de válvulas.",
    status: "in_repair",
    quoteStatus: "approved",
    estimatedCost: 350000,
    createdAt: daysAgo(2),
    paid: false,
  });

  await seedServiceOrder({
    vehicleId: honda.id,
    customerId: clienteDemo.id,
    mechanicId: mechanicDos.id,
    problemDescription: "Fuga de aceite cerca del cárter.",
    status: "quote_sent",
    quoteStatus: "pending",
    estimatedCost: 220000,
    createdAt: daysAgo(1),
    paid: false,
  });

  await seedServiceOrder({
    vehicleId: honda.id,
    customerId: clienteDemo.id,
    mechanicId: mechanicDos.id,
    problemDescription: "Revisión de frenos, se sienten esponjosos.",
    status: "diagnosing",
    quoteStatus: null,
    estimatedCost: null,
    createdAt: daysAgo(6),
    paid: false,
  });

  await seedServiceOrder({
    vehicleId: suzuki.id,
    customerId: clienteDos.id,
    mechanicId: mechanicUno.id,
    problemDescription: "Mantenimiento preventivo de 5.000km.",
    status: "received",
    quoteStatus: null,
    estimatedCost: null,
    createdAt: daysAgo(0),
    paid: false,
  });

  await seedServiceOrder({
    vehicleId: suzuki.id,
    customerId: clienteDos.id,
    mechanicId: mechanicUno.id,
    problemDescription: "Cambio de kit de arrastre completo.",
    status: "quality_check",
    quoteStatus: "approved",
    estimatedCost: 310000,
    createdAt: daysAgo(5),
    paid: false,
  });

  await seedServiceOrder({
    vehicleId: suzuki.id,
    customerId: clienteDos.id,
    mechanicId: mechanicDos.id,
    problemDescription: "Ajuste de carburación y sincronización.",
    status: "ready_for_pickup",
    quoteStatus: "approved",
    estimatedCost: 90000,
    createdAt: daysAgo(4),
    paid: false,
  });

  await seedServiceOrder({
    vehicleId: bajaj.id,
    customerId: clienteDos.id,
    mechanicId: mechanicDos.id,
    problemDescription: "Cambio de llantas delantera y trasera.",
    status: "approved",
    quoteStatus: "approved",
    estimatedCost: 410000,
    createdAt: daysAgo(3),
    paid: false,
  });
}

async function seedAddresses(clienteDemo: { id: string }, clienteDos: { id: string }) {
  const [addressDemo, addressDos] = await Promise.all([
    prisma.address.create({
      data: {
        userId: clienteDemo.id,
        line1: "Calle 123 #45-67",
        city: "Bogotá",
        reference: "Portería azul",
      },
    }),
    prisma.address.create({
      data: { userId: clienteDos.id, line1: "Carrera 45 #10-20", city: "Bogotá", reference: null },
    }),
  ]);

  return { addressDemo, addressDos };
}

type StoreOrderPlan = {
  customerId: string;
  status: "pending_payment" | "paid" | "preparing" | "ready_or_shipped" | "delivered" | "cancelled";
  deliveryMethod: "pickup" | "delivery";
  addressId: string | null;
  items: { productId: string; quantity: number; unitPrice: number }[];
  paymentProvider: "mercadopago" | "cash" | null;
  createdAt: Date;
};

async function seedStoreOrder(plan: StoreOrderPlan) {
  const subtotal = plan.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const shippingCost = plan.deliveryMethod === "delivery" ? FIXED_SHIPPING_COST : 0;
  const total = subtotal + shippingCost;

  const order = await prisma.order.create({
    data: {
      customerId: plan.customerId,
      status: plan.status,
      deliveryMethod: plan.deliveryMethod,
      addressId: plan.addressId,
      shippingCost,
      subtotal,
      total,
      createdAt: plan.createdAt,
      items: { create: plan.items },
    },
  });

  if (plan.paymentProvider) {
    await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: { provider: plan.paymentProvider!, status: "approved", amount: total, orderId: order.id },
      });
      const number = await getNextInvoiceNumber(tx, "store");
      const invoiceId = randomUUID();
      await tx.invoice.create({
        data: {
          id: invoiceId,
          paymentId: payment.id,
          number,
          series: "store",
          pdfUrl: `/api/invoices/${invoiceId}/pdf`,
        },
      });
    });
  }

  return order;
}

async function seedStoreOrders(
  products: Awaited<ReturnType<typeof seedCatalog>>["products"],
  users: Awaited<ReturnType<typeof seedUsers>>,
  addresses: Awaited<ReturnType<typeof seedAddresses>>
) {
  const byName = (name: string) => {
    const product = products.find((p) => p.name === name);
    if (!product) throw new Error(`Producto de seed no encontrado: ${name}`);
    return product;
  };

  const aceite = byName("Aceite de motor 20W50 (1L)");
  const kitLimpieza = byName("Kit de limpieza y lubricación de cadena");
  const casco = byName("Casco MT integral");
  const guantes = byName("Guantes de protección");
  const pastillas = byName("Pastillas de freno delanteras");
  const bateria = byName("Batería 12V sellada");
  const kitArrastre = byName("Kit de arrastre (piñón, corona, cadena)");
  const liquidoFrenos = byName("Líquido de frenos DOT4");
  const maletero = byName("Maletero trasero 32L");

  const { clienteDemo, clienteDos } = users;
  const { addressDemo, addressDos } = addresses;

  await seedStoreOrder({
    customerId: clienteDos.id,
    status: "pending_payment",
    deliveryMethod: "pickup",
    addressId: null,
    items: [
      { productId: aceite.id, quantity: 2, unitPrice: Number(aceite.price) },
      { productId: kitLimpieza.id, quantity: 1, unitPrice: Number(kitLimpieza.price) },
    ],
    paymentProvider: null,
    createdAt: daysAgo(0),
  });

  await seedStoreOrder({
    customerId: clienteDemo.id,
    status: "paid",
    deliveryMethod: "delivery",
    addressId: addressDemo.id,
    items: [{ productId: casco.id, quantity: 1, unitPrice: Number(casco.price) }],
    paymentProvider: "mercadopago",
    createdAt: daysAgo(3),
  });

  await seedStoreOrder({
    customerId: clienteDos.id,
    status: "preparing",
    deliveryMethod: "delivery",
    addressId: addressDos.id,
    items: [
      { productId: guantes.id, quantity: 1, unitPrice: Number(guantes.price) },
      { productId: pastillas.id, quantity: 1, unitPrice: Number(pastillas.price) },
    ],
    paymentProvider: "cash",
    createdAt: daysAgo(2),
  });

  await seedStoreOrder({
    customerId: clienteDemo.id,
    status: "ready_or_shipped",
    deliveryMethod: "pickup",
    addressId: null,
    items: [{ productId: bateria.id, quantity: 1, unitPrice: Number(bateria.price) }],
    paymentProvider: "mercadopago",
    createdAt: daysAgo(4),
  });

  await seedStoreOrder({
    customerId: clienteDos.id,
    status: "delivered",
    deliveryMethod: "delivery",
    addressId: addressDos.id,
    items: [
      { productId: kitArrastre.id, quantity: 1, unitPrice: Number(kitArrastre.price) },
      { productId: liquidoFrenos.id, quantity: 1, unitPrice: Number(liquidoFrenos.price) },
    ],
    paymentProvider: "mercadopago",
    createdAt: daysAgo(8),
  });

  await seedStoreOrder({
    customerId: clienteDemo.id,
    status: "cancelled",
    deliveryMethod: "pickup",
    addressId: null,
    items: [{ productId: maletero.id, quantity: 1, unitPrice: Number(maletero.price) }],
    paymentProvider: null,
    createdAt: daysAgo(6),
  });
}

async function main() {
  await resetBusinessData();
  const users = await seedUsers();
  const { products } = await seedCatalog();
  const vehicles = await seedVehicles(users.clienteDemo, users.clienteDos);
  await seedServiceOrders(vehicles, users);
  const addresses = await seedAddresses(users.clienteDemo, users.clienteDos);
  await seedStoreOrders(products, users, addresses);

  console.log("Seed completo. Credenciales:");
  console.log("  admin.demo@example.com / Admin12345");
  console.log("  mecanico.uno@example.com / Mecanico123");
  console.log("  mecanico.dos@example.com / Mecanico123");
  console.log("  cliente.demo@example.com / Demo12345");
  console.log("  cliente.dos@example.com / Demo12345");

  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
