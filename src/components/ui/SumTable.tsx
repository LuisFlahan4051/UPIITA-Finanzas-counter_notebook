import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MovementLine {
  concepto: string;
  cargo: number | string;
  abono: number | string;
}

interface SumTableProps {
  title: string;
  lines: MovementLine[];
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

export function SumTable({ title, lines }: SumTableProps) {
  const totalCargo = lines.reduce((sum, line) => {
    const value = line.cargo;
    const numericValue = typeof value === "number" ? value : 0;
    return sum + numericValue;
  }, 0);

  const totalAbono = lines.reduce((sum, line) => {
    const value = line.abono;
    const numericValue = typeof value === "number" ? value : 0;
    return sum + numericValue;
  }, 0);

  const saldo = totalCargo - totalAbono;

  return (
    <Card className="border-border bg-card text-card-foreground shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-b bg-muted/50">
              <TableHead className="w-[60%] font-semibold">Concepto</TableHead>
              <TableHead className="text-right font-semibold">Cargo</TableHead>
              <TableHead className="text-right font-semibold">Abono</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lines.map((line, index) => (
              <TableRow key={index} className="border-b last:border-0">
                <TableCell className="font-medium">{line.concepto}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCurrencyDisplay(line.cargo)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCurrencyDisplay(line.abono)}
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="border-t-2 border-border bg-muted/30 font-semibold">
              <TableCell className="font-semibold">Suma</TableCell>
              <TableCell className="text-right tabular-nums">
                {formatCurrencyDisplay(totalCargo)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatCurrencyDisplay(totalAbono)}
              </TableCell>
            </TableRow>
            <TableRow className="border-t bg-muted/50 font-semibold">
              <TableCell className="font-semibold">Saldo</TableCell>
              <TableCell className="text-right tabular-nums" colSpan={2}>
                {formatCurrencyDisplay(saldo)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
