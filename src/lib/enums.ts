// Hand-rolled enums because SQLite + Prisma doesn't support `enum`.
// The DB stores plain strings; these constants keep the application type-safe.
// If we later migrate to Postgres/MySQL we can swap to real Prisma enums and
// drop this file (the runtime values are identical).

export const Role = {
  ADMIN: "ADMIN",
  UMKM: "UMKM",
  BUYER: "BUYER",
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const OrderStatus = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export const ORDER_STATUSES: OrderStatus[] = Object.values(OrderStatus);
