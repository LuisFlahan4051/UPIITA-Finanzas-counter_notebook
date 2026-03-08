import { useEffect, useRef, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, ArrowLeftRight, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MovementLine {
  concepto: string;
  cargo: number | string;
  abono: number | string;
}

type NumericField = "cargo" | "abono";

interface MovementTableProps {
  title: string;
  lines: MovementLine[];
  onLinesChange?: (lines: MovementLine[]) => void;
  conceptOptions?: string[];
}

const DEFAULT_CONCEPT_OPTIONS = [
  "Caja",
  "Bancos",
  "Clientes",
  "Proveedores",
  "Inventario",
  "Ventas",
  "Compras",
  "Capital",
];

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const parseCurrencyInput = (rawValue: string): number | "" => {
  const normalized = rawValue.replace(/[^\d.-]/g, "");
  if (normalized.trim() === "") {
    return "";
  }

  const parsed = Number(normalized);
  return Number.isNaN(parsed) ? "" : parsed;
};

const formatCurrencyDisplay = (value: number | string): string => {
  if (value === "") {
    return "";
  }

  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) {
    return "";
  }

  return currencyFormatter.format(numericValue);
};

export function MovementTable({
  title,
  lines,
  onLinesChange,
  conceptOptions,
}: MovementTableProps) {
  const [editableLines, setEditableLines] = useState<MovementLine[]>(lines);
  const [editingCellKey, setEditingCellKey] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState("");
  const [pendingFocusKey, setPendingFocusKey] = useState<string | null>(null);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const availableConcepts = Array.from(
    new Set([
      ...DEFAULT_CONCEPT_OPTIONS,
      ...(conceptOptions ?? []),
      ...lines.map((line) => line.concepto),
    ]),
  );

  useEffect(() => {
    setEditableLines(lines);
  }, [lines]);

  useEffect(() => {
    if (!pendingFocusKey) {
      return;
    }

    const targetInput = inputRefs.current[pendingFocusKey];
    if (targetInput) {
      targetInput.focus();
      setPendingFocusKey(null);
    }
  }, [editableLines, pendingFocusKey]);

  const updateConceptLine = (index: number, value: string) => {
    const nextLines = editableLines.map((line, lineIndex) => {
      if (lineIndex !== index) {
        return line;
      }

      return { ...line, concepto: value };
    });

    setEditableLines(nextLines);
    onLinesChange?.(nextLines);
  };

  const updateNumericLine = (
    index: number,
    field: NumericField,
    value: number | "",
  ) => {
    const nextLines = editableLines.map((line, lineIndex) => {
      if (lineIndex !== index) {
        return line;
      }

      return {
        ...line,
        [field]: value,
      };
    });

    setEditableLines(nextLines);
    onLinesChange?.(nextLines);
  };

  const getCellKey = (index: number, field: NumericField) =>
    `${index}-${field}`;

  const getInputDisplayValue = (index: number, field: NumericField) => {
    const key = getCellKey(index, field);
    if (editingCellKey === key) {
      return editingDraft;
    }

    return formatCurrencyDisplay(editableLines[index][field]);
  };

  const handleNumericFocus = (index: number, field: NumericField) => {
    const key = getCellKey(index, field);
    const currentValue = editableLines[index][field];
    const rawValue = currentValue === "" ? "" : String(currentValue);

    setEditingCellKey(key);
    setEditingDraft(rawValue);
  };

  const handleNumericChange = (value: string) => {
    setEditingDraft(value);
  };

  const handleNumericBlur = (index: number, field: NumericField) => {
    const parsedValue = parseCurrencyInput(editingDraft);
    updateNumericLine(index, field, parsedValue);
    setEditingCellKey(null);
    setEditingDraft("");
  };

  const addNewLine = () => {
    const newLine: MovementLine = {
      concepto: availableConcepts[0] || "",
      cargo: "",
      abono: "",
    };
    const nextLines = [...editableLines, newLine];
    setEditableLines(nextLines);
    onLinesChange?.(nextLines);
  };

  const addNewLineAndFocus = (focusField: NumericField) => {
    const newLine: MovementLine = {
      concepto: availableConcepts[0] || "",
      cargo: "",
      abono: "",
    };
    const nextLines = [...editableLines, newLine];
    const newRowIndex = nextLines.length - 1;

    setEditableLines(nextLines);
    onLinesChange?.(nextLines);
    setPendingFocusKey(getCellKey(newRowIndex, focusField));
  };

  const removeLine = (index: number) => {
    const nextLines = editableLines.filter(
      (_, lineIndex) => lineIndex !== index,
    );
    setEditableLines(nextLines);
    onLinesChange?.(nextLines);
    setEditingCellKey(null);
    setEditingDraft("");
  };

  const moveLine = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= editableLines.length) {
      return;
    }

    const nextLines = [...editableLines];
    const currentLine = nextLines[index];
    nextLines[index] = nextLines[targetIndex];
    nextLines[targetIndex] = currentLine;

    setEditableLines(nextLines);
    onLinesChange?.(nextLines);
    setEditingCellKey(null);
    setEditingDraft("");
  };

  const focusCell = (index: number, field: NumericField) => {
    const targetInput = inputRefs.current[getCellKey(index, field)];
    if (targetInput) {
      targetInput.focus();
    }
  };

  const handleNumericKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    index: number,
    field: NumericField,
  ) => {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (index > 0) {
        focusCell(index - 1, field);
      }
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (index < editableLines.length - 1) {
        focusCell(index + 1, field);
      }
      return;
    }

    if (event.key === "ArrowRight" && field === "cargo") {
      event.preventDefault();
      focusCell(index, "abono");
      return;
    }

    if (event.key === "ArrowLeft" && field === "abono") {
      event.preventDefault();
      focusCell(index, "cargo");
      return;
    }

    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();

    const isLastRow = index === editableLines.length - 1;
    const isLastField = field === "abono";

    if (isLastRow && isLastField) {
      addNewLineAndFocus("cargo");
      return;
    }

    if (field === "cargo") {
      focusCell(index, "abono");
      return;
    }

    (event.currentTarget as HTMLInputElement).blur();
  };

  const swapCargoAbono = (index: number) => {
    const nextLines = editableLines.map((line, lineIndex) => {
      if (lineIndex !== index) {
        return line;
      }

      return {
        ...line,
        cargo: line.abono,
        abono: line.cargo,
      };
    });

    setEditableLines(nextLines);
    onLinesChange?.(nextLines);
    setEditingCellKey(null);
    setEditingDraft("");
  };

  const calculateTotal = (field: NumericField): number => {
    return editableLines.reduce((sum, line) => {
      const value = line[field];
      const numericValue = typeof value === "number" ? value : 0;
      return sum + numericValue;
    }, 0);
  };

  const totalCargo = calculateTotal("cargo");
  const totalAbono = calculateTotal("abono");
  const saldo = totalCargo - totalAbono;

  return (
    <Card className="border-border bg-card text-card-foreground shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-b bg-muted/50 hover:bg-muted/80">
              <TableHead className="w-[50%] font-semibold">Concepto</TableHead>
              <TableHead className="text-right font-semibold">Cargo</TableHead>
              <TableHead className="text-right font-semibold">Abono</TableHead>
              <TableHead className="text-center font-semibold">
                Opcion
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {editableLines.map((line, index) => (
              <TableRow key={index} className="border-b last:border-0">
                <TableCell className="font-medium">
                  <select
                    value={line.concepto}
                    onChange={(event) =>
                      updateConceptLine(index, event.target.value)
                    }
                    className="w-full rounded-md border border-border bg-background px-2 py-1 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {availableConcepts.map((concept) => (
                      <option key={concept} value={concept}>
                        {concept}
                      </option>
                    ))}
                  </select>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  <input
                    type="text"
                    inputMode="decimal"
                    ref={(element) => {
                      inputRefs.current[getCellKey(index, "cargo")] = element;
                    }}
                    value={getInputDisplayValue(index, "cargo")}
                    onFocus={() => handleNumericFocus(index, "cargo")}
                    onChange={(event) =>
                      handleNumericChange(event.target.value)
                    }
                    onKeyDown={(event) =>
                      handleNumericKeyDown(event, index, "cargo")
                    }
                    onBlur={() => handleNumericBlur(index, "cargo")}
                    className="w-full rounded-md border border-border bg-background px-2 py-1 text-right text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  <input
                    type="text"
                    inputMode="decimal"
                    ref={(element) => {
                      inputRefs.current[getCellKey(index, "abono")] = element;
                    }}
                    value={getInputDisplayValue(index, "abono")}
                    onFocus={() => handleNumericFocus(index, "abono")}
                    onChange={(event) =>
                      handleNumericChange(event.target.value)
                    }
                    onKeyDown={(event) =>
                      handleNumericKeyDown(event, index, "abono")
                    }
                    onBlur={() => handleNumericBlur(index, "abono")}
                    className="w-full rounded-md border border-border bg-background px-2 py-1 text-right text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => moveLine(index, "up")}
                      disabled={index === 0}
                      className="hover:cursor-pointer"
                      aria-label={`Subir fila ${index + 1}`}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => moveLine(index, "down")}
                      disabled={index === editableLines.length - 1}
                      className="hover:cursor-pointer"
                      aria-label={`Bajar fila ${index + 1}`}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => swapCargoAbono(index)}
                      className="hover:cursor-pointer"
                      aria-label={`Intercambiar cargo y abono de fila ${index + 1}`}
                    >
                      <ArrowLeftRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removeLine(index)}
                      className="text-destructive hover:cursor-pointer hover:bg-destructive/10"
                      aria-label={`Eliminar fila ${index + 1}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
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
              <TableCell />
            </TableRow>
            <TableRow className="border-t bg-muted/50 font-semibold">
              <TableCell className="font-semibold">Saldo</TableCell>
              <TableCell className="text-right tabular-nums" colSpan={3}>
                {formatCurrencyDisplay(saldo)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <div className="mt-3 flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={addNewLine}
            className="hover:cursor-pointer"
          >
            <Plus className="mr-1 h-4 w-4" />
            Agregar Concepto
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
