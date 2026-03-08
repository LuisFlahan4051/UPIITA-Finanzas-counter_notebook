export const accountsTypes = {
  Activo: [
    "Caja",
    "Banco",
    "Almacén de producto terminado",
    "Clientes",
    "Documentos por cobrar",
    "Deudores diversos",
    "Terrenos",
    "Edificios",
    "Mobiliario y equipo",
    "Equipo de cómputo",
    "Equipo de entrega o de reparto",
    "Depósitos en garantía",
    "Gastos de instalación",
    "Papelería y útiles",
    "Propaganda o publicidad",
    "Primas de seguros",
    "Rentas pagadas por anticipado",
    "Intereses pagados por anticipado",
    "IVA Acreditado",
    "Producción en proceso",
    "Depreciación Acumulada de Maquinaria y Equipo",
    "Depreciación Acumulada de Equipo de Reparto",
  ],
  Pasivo: [
    "Proveedores",
    "Documentos por pagar",
    "Acreedores diversos",
    "Acreedores hipotecarios (Hipotecas por pagar)",
    "Intereses cobrados por anticipado",
    "Rentas cobradas por anticipado",
    "IVA Trasladado",
    "IVA por pagar",
  ],
  Ingreso: [
    "Ventas",
    "Productos financieros",
    "Otros productos",
    "Producción en proceso",
  ],
  Egreso: [
    "Costo de Ventas",
    "Gastos de Operación:",
    "Gastos de Administración",
    "Gastos de Venta",
    "Gastos Financieros",
    "Otros Gastos",
    "Producción en proceso",
  ],
  Capital: [
    "Capital contable",
  ],
  "Cuenta Orden": [
    "Producción en proceso",
  ],
} as const;

export type AccountType = keyof typeof accountsTypes;

export type AccountConcept = (typeof accountsTypes)[AccountType][number];

export interface MovementLine {
  concepto: AccountConcept;
  type: AccountType;
  cargo: number | string;
  abono: number | string;
}

export interface Movement {
  id: number;
  title: string;
  lines: MovementLine[];
}

export const movementsData: Movement[] = [
  {
    id: 1,
    title: "Movimiento 1",
    lines: [
      { concepto: "Banco", type: "Activo", cargo: 800000, abono: "" },
      { concepto: "Mobiliario y equipo", type: "Activo", cargo: 750000, abono: "" },
      { concepto: "Equipo de entrega o de reparto", type: "Activo", cargo: 250000, abono: "" },
      { concepto: "Capital contable", type: "Capital", cargo: "", abono: 1800000 },
    ],
  },
  {
    id: 2,
    title: "Movimiento 2",
    lines: [
      { concepto: "Rentas pagadas por anticipado", type: "Activo", cargo: 1800000, abono: "" },
      { concepto: "IVA Acreditado", type: "Activo", cargo: 288000, abono: "" },
      { concepto: "Banco", type: "Activo", cargo: "", abono: 2088000 },
    ],
  },
  {
    id: 3,
    title: "Movimiento 3",
    lines: [
      { concepto: "Almacén de producto terminado", type: "Activo", cargo: 150000, abono: "" },
      { concepto: "IVA Acreditado", type: "Activo", cargo: 24000, abono: "" },
      { concepto: "Banco", type: "Activo", cargo: "", abono: 174000 },
    ],
  },
  {
    id: 4,
    title: "Movimiento 4",
    lines: [
      { concepto: "Almacén de producto terminado", type: "Activo", cargo: 120000, abono: "" },
      { concepto: "IVA Acreditado", type: "Activo", cargo: 19200, abono: "" },
      { concepto: "Proveedores", type: "Pasivo", cargo: "", abono: 139200 },
    ],
  },
  {
    id: 5,
    title: "Movimiento 5",
    lines: [
      { concepto: "Producción en proceso", type: "Activo", cargo: 96000, abono: "" },
      { concepto: "Almacén de producto terminado", type: "Activo", cargo: "", abono: 96000 },
    ],
  },
  {
    id: 6,
    title: "Movimiento 6",
    lines: [
      { concepto: "Producción en proceso", type: "Activo", cargo: 25000, abono: "" },
      { concepto: "Gastos de Administración", type: "Egreso", cargo: 30000, abono: "" },
      { concepto: "Gastos de Venta", type: "Egreso", cargo: 15000, abono: "" },
      { concepto: "Banco", type: "Activo", cargo: "", abono: 70000 },
    ],
  },
  {
    id: 7,
    title: "Movimiento 7",
    lines: [
      { concepto: "Gastos de Venta", type: "Egreso", cargo: "", abono: 10000 },
      { concepto: "IVA Acreditado", type: "Activo", cargo: "", abono: 1600 },
      { concepto: "Banco", type: "Activo", cargo: "", abono: 11600 },
    ],
  },
  {
    id: 8,
    title: "Movimiento 8",
    lines: [
      { concepto: "Banco", type: "Activo", cargo: 5800, abono: "" },
      { concepto: "Otros productos", type: "Ingreso", cargo: "", abono: 5000 },
      { concepto: "IVA Trasladado", type: "Pasivo", cargo: "", abono: 800 },
    ],
  },
  {
    id: 9,
    title: "Movimiento 9",
    lines: [
      { concepto: "Edificios", type: "Activo", cargo: "", abono: 58000 },
      { concepto: "IVA Acreditado", type: "Activo", cargo: "", abono: 9280 },
      { concepto: "Banco", type: "Activo", cargo: "", abono: 67280 },
    ],
  },
  {
    id: 10,
    title: "Movimiento 10",
    lines: [
      { concepto: "Proveedores", type: "Pasivo", cargo: 139200, abono: "" },
      { concepto: "Banco", type: "Activo", cargo: "", abono: 139200 },
    ],
  },
  {
    id: 11,
    title: "Movimiento 11",
    lines: [
      { concepto: "Gastos de Venta", type: "Egreso", cargo: 9900, abono: "" },
      { concepto: "Gastos de Administración", type: "Egreso", cargo: 9900, abono: "" },
      { concepto: "Producción en proceso", type: "Cuenta Orden", cargo: 10200, abono: "" },
      { concepto: "IVA Acreditado", type: "Activo", cargo: 4800, abono: "" },
      { concepto: "Banco", type: "Activo", cargo: "", abono: 34800 },
    ],
  },
  {
    id: 12,
    title: "Movimiento 12",
    lines: [
      { concepto: "Gastos de Administración", type: "Egreso", cargo: 150000, abono: "" },
      { concepto: "Rentas pagadas por anticipado", type: "Activo", cargo: "", abono: 150000 },
    ],
  },
  {
    id: 13,
    title: "Movimiento 13",
    lines: [
      { concepto: "Depreciación Acumulada de Maquinaria y Equipo", type: "Activo", cargo: "", abono: 6250 },
      { concepto: "Depreciación Acumulada de Equipo de Reparto", type: "Activo", cargo: "", abono: 5208.33 },
      { concepto: "Gastos de Venta", type: "Egreso", cargo: 528.33, abono: "" },
      { concepto: "Producción en proceso", type: "Egreso", cargo: 6250, abono: "" },
    ],
  },
  {
    id: 14,
    title: "Movimiento 14",
    lines: [
      { concepto: "Producción en proceso", type: "Ingreso", cargo: 25000, abono: "" },
      { concepto: "Gastos de Venta", type: "Egreso", cargo: 15000, abono: "" },
      { concepto: "Gastos de Administración", type: "Egreso", cargo: 30000, abono: "" },
      { concepto: "Banco", type: "Activo", cargo: "", abono: 70000 },
    ],
  },
  {
    id: 15,
    title: "Movimiento 15",
    lines: [
      { concepto: "Producción en proceso", type: "Ingreso", cargo: "", abono: 168033.33 },
      { concepto: "Almacén de producto terminado", type: "Activo", cargo: 168033.33, abono: "" },
    ],
  },
  {
    id: 16,
    title: "Movimiento 16",
    lines: [
      { concepto: "Banco", type: "Activo", cargo: 649600, abono: "" },
      { concepto: "Ventas", type: "Ingreso", cargo: "", abono: 560000 },
      { concepto: "IVA Trasladado", type: "Pasivo", cargo: "", abono: 89600 },
      { concepto: "Almacén de producto terminado", type: "Activo", cargo: "", abono: 134426.40 },
      { concepto: "Gastos de Venta", type: "Egreso", cargo: 134426.40, abono: "" },
    ],
  },
  {
    id: 17,
    title: "Movimiento 17",
    lines: [
      { concepto: "Clientes", type: "Activo", cargo: 130500, abono: "" },
      { concepto: "Ventas", type: "Ingreso", cargo: "", abono: 112500 },
      { concepto: "IVA Trasladado", type: "Pasivo", cargo: "", abono: 18000 },
      { concepto: "Almacén de producto terminado", type: "Activo", cargo: "", abono: 25204.95 },
      { concepto: "Gastos de Venta", type: "Egreso", cargo: 25204.95, abono: "" },
    ],
  },
  {
    id: 18,
    title: "Movimiento 18",
    lines: [
      { concepto: "Productos financieros", type: "Ingreso", cargo: "", abono: 6000 },
      { concepto: "Banco", type: "Activo", cargo: 6000, abono: "" },
    ],
  },
  {
    id: 19,
    title: "Movimiento 19",
    lines: [
      { concepto: "IVA Trasladado", type: "Pasivo", cargo: 108400, abono: "" },
      { concepto: "IVA Acreditado", type: "Activo", cargo: "", abono: 346880 },
      { concepto: "IVA por pagar", type: "Pasivo", cargo: 238480, abono: "" },
    ],
  },
];
