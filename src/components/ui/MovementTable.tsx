import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils"; // lo crearemos después

interface AccountingTableProps {
  title: string;
  lines: Array<{
    concepto: string;
    cargo: number | string;
    abono: number | string;
  }>;
}

export function AccountingTable({ title, lines }: AccountingTableProps) {
  return (
    <Card className="border-border bg-card text-card-foreground shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-b bg-muted/50 hover:bg-muted/80">
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
                  {line.cargo ? formatCurrency(Number(line.cargo)) : "—"}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {line.abono ? formatCurrency(Number(line.abono)) : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
