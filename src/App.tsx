import "./App.css";
import { useMemo, useState } from "react";
import { MovementTable } from "./components/ui/MovementTable";
import { SumTable } from "./components/ui/SumTable";
import {
  accountsTypes,
  AccountType,
  AccountConcept,
  movementsData,
  Movement,
  MovementLine,
} from "./data/movements";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface SumRow {
  movimiento: string;
  concepto: AccountConcept;
  type: AccountType;
  cargo: number;
  abono: number;
}

interface ConceptSummary {
  key: string;
  title: string;
  rows: SumRow[];
}

function App() {
  const [movements, setMovements] = useState<Movement[]>(movementsData);

  const handleNewMovement = () => {
    const newMovement: Movement = {
      id: Date.now(),
      title: `Movimiento ${movements.length + 1}`,
      lines: [{ concepto: "Caja", type: "Activo", cargo: "", abono: "" }],
    };
    setMovements([...movements, newMovement]);
  };

  const handleLinesChange = (
    movementId: number,
    updatedLines: MovementLine[],
  ) => {
    setMovements(
      movements.map((movement) =>
        movement.id === movementId
          ? { ...movement, lines: updatedLines }
          : movement,
      ),
    );
  };

  const conceptSummaries = useMemo<ConceptSummary[]>(() => {
    const summaries: ConceptSummary[] = [];

    (Object.keys(accountsTypes) as AccountType[]).forEach((type) => {
      accountsTypes[type].forEach((concepto) => {
        const rows = movements
          .map((movement) => {
            const conceptLines = movement.lines.filter(
              (line) => line.type === type && line.concepto === concepto,
            );

            if (conceptLines.length === 0) {
              return null;
            }

            const cargo = conceptLines.reduce(
              (sum, line) =>
                sum + (typeof line.cargo === "number" ? line.cargo : 0),
              0,
            );
            const abono = conceptLines.reduce(
              (sum, line) =>
                sum + (typeof line.abono === "number" ? line.abono : 0),
              0,
            );

            return {
              movimiento: movement.title,
              concepto,
              type,
              cargo,
              abono,
            };
          })
          .filter((row): row is SumRow => row !== null);

        if (rows.length > 0) {
          summaries.push({
            key: `${type}::${concepto}`,
            title: concepto,
            rows,
          });
        }
      });
    });

    return summaries;
  }, [movements]);

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-8xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">
            Registro de Movimientos Contables
          </h1>
          {/* <Button variant="default" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Movimiento
          </Button> */}
        </div>

        {/* Grid de dos columnas: Movements y Sums */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {/* Columna: Tablas de Movements */}
          <div className="space-y-6 max-h-[calc(100vh-250px)] overflow-y-auto pr-2 pl-2 pb-4">
            <h2 className="text-xl font-semibold">Movimientos</h2>
            <div className="space-y-6">
              {movements.map((movement) => (
                <MovementTable
                  key={movement.id}
                  title={movement.title}
                  lines={movement.lines}
                  onLinesChange={(lines) =>
                    handleLinesChange(movement.id, lines)
                  }
                />
              ))}
            </div>
          </div>

          {/* Columna: Tablas de Sums */}
          <div className="space-y-6 max-h-[calc(100vh-250px)] overflow-y-auto pr-2 pl-2 pb-4">
            <h2 className="text-xl font-semibold">Sumas</h2>
            <div className="space-y-6">
              {conceptSummaries.map((summary) => (
                <SumTable
                  key={summary.key}
                  title={summary.title}
                  rows={summary.rows}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Botón de ejemplo para agregar más en el futuro */}
        <div className="flex flex-wrap items-center gap-3 pt-8">
          <Button
            variant="default"
            size="lg"
            onClick={handleNewMovement}
            className="hover:cursor-pointer"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Movimiento
          </Button>
          <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
            Activo
          </span>
          <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
            Pasivo
          </span>
          <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
            Ingreso
          </span>
          <span className="rounded-full bg-violet-100 px-3 py-1 text-sm font-medium text-violet-700">
            Egreso
          </span>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-black-700">
            Capital
          </span>
        </div>
      </div>
    </div>
  );
}

export default App;
