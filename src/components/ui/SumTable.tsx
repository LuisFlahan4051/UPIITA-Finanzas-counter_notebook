import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AccountType,
  AccountConcept,
  cuentaPorNombre,
  NaturalezaSaldo,
} from "@/data/movements";

interface SumRow {
  movimiento: string;
  concepto: AccountConcept;
  type: AccountType;
  cargo: number;
  abono: number;
}

interface SumTableProps {
  title: string;
  naturalezaSaldo: NaturalezaSaldo;
  rows: SumRow[];
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatCurrencyDisplay = (value: number | string): string => {
  if (value === "" || value === 0) {
    return "—";
  }

  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) {
    return "—";
  }

  return currencyFormatter.format(numericValue);
};

const getTypeTextClass = (type: AccountType): string => {
  switch (type) {
    case "Ingreso":
      return "text-blue-700";
    case "Egreso":
      return "text-violet-700";
    case "Activo":
      return "text-green-700";
    case "Pasivo":
      return "text-red-700";
    case "Capital":
      return "text-slate-700";
    case "Auxiliar":
      return "text-cyan-700";
    default:
      return "text-black";
  }
};

const getTypeTextColor = (type: AccountType, concepto?: string): string => {
  const cuenta = concepto ? cuentaPorNombre(concepto) : undefined;

  switch (type) {
    case "Ingreso":
      return "#1d4ed8";
    case "Egreso":
      return "#6d28d9";
    case "Activo":
      switch (cuenta?.tipo) {
        case "circulante":
          return "#18b652";
        case "fijo":
          return "#156433";
        case "diferido":
          return "#63a50d";
        case "contra_activo":
          return "#325703";
        default:
          return "#18b652";
      }
    case "Pasivo":
      switch (cuenta?.tipo) {
        case "circulante":
          return "#d31919";
        case "fijo":
          return "#741414";
        case "diferido":
          return "#c2410c";
        default:
          return "#b91c1c";
      }
    case "Capital":
      return "#123b25";
    case "Auxiliar":
      return "#00f729";
    default:
      return "#000000";
  }
};

export function SumTable({ title, naturalezaSaldo, rows }: SumTableProps) {
  const totalCargo = rows.reduce((sum, row) => sum + row.cargo, 0);

  const totalAbono = rows.reduce((sum, row) => sum + row.abono, 0);

  const saldo =
    naturalezaSaldo === "deudora"
      ? totalCargo - totalAbono
      : totalAbono - totalCargo;

  return (
    <Card className="border-border bg-card text-card-foreground shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-b bg-muted/50">
              <TableHead className="w-[40%] font-semibold">
                Movimiento
              </TableHead>
              <TableHead className="w-[30%] font-semibold">Concepto</TableHead>
              <TableHead className="text-right font-semibold">Cargo</TableHead>
              <TableHead className="text-right font-semibold">Abono</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={index} className="border-b last:border-0">
                <TableCell className="font-medium">{row.movimiento}</TableCell>
                <TableCell
                  className={`font-medium ${getTypeTextClass(row.type)}`}
                  style={{ color: getTypeTextColor(row.type, row.concepto) }}
                >
                  {row.concepto}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCurrencyDisplay(row.cargo)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCurrencyDisplay(row.abono)}
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="border-t-2 border-border bg-muted/30 font-semibold">
              <TableCell className="font-semibold">Suma</TableCell>
              <TableCell />
              <TableCell className="text-right tabular-nums">
                {formatCurrencyDisplay(totalCargo)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatCurrencyDisplay(totalAbono)}
              </TableCell>
            </TableRow>
            <TableRow className="border-t bg-muted/50 font-semibold">
              <TableCell className="font-semibold">Saldo</TableCell>
              <TableCell />
              <TableCell className="text-right tabular-nums">
                {naturalezaSaldo === "deudora"
                  ? formatCurrencyDisplay(saldo)
                  : "—"}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {naturalezaSaldo === "acreedora"
                  ? formatCurrencyDisplay(saldo)
                  : "—"}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
