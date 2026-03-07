export interface MovementLine {
  concepto: string;
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
      { concepto: "Banco (Activo)", cargo: 800000, abono: "" },
      { concepto: "Mobiliario y equipo (Activo)", cargo: 750000, abono: "" },
      { concepto: "Equipo de entrega o de reparto (Activo)", cargo: 250000, abono: "" },
      { concepto: "Capital contable (Capital)", cargo: "", abono: 1800000 },
    ],
  },
  {
    id: 2,
    title: "Movimiento 2",
    lines: [
      { concepto: "Rentas pagadas por anticipado (Activo)", cargo: 1800000, abono: "" },
      { concepto: "IVA Acreditado (Activo)", cargo: 288000, abono: "" },
      { concepto: "Banco (Activo)", cargo: "", abono: 2088000 },
    ],
  },
  {
    id: 8,
    title: "Movimiento 8",
    lines: [
      { concepto: "Banco (Activo)", cargo: 5800, abono: "" },
      { concepto: "Otros productos (Ingreso)", cargo: "", abono: 5000 },
      { concepto: "IVA Trasladado (Pasivo)", cargo: "", abono: 800 },
    ],
  },
  // Agrega más movimientos siguiendo el mismo patrón...
];