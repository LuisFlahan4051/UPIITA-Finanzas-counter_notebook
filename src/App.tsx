import "./App.css";
import { useState } from "react";
import { MovementTable } from "./components/ui/MovementTable";
import { SumTable } from "./components/ui/SumTable";
import { movementsData, Movement } from "./data/movements";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

function App() {
  const [movements, setMovements] = useState<Movement[]>(movementsData);

  const handleNewMovement = () => {
    const newMovement: Movement = {
      id: Date.now(),
      title: `Movimiento ${movements.length + 1}`,
      lines: [{ concepto: "Caja", cargo: "", abono: "" }],
    };
    setMovements([...movements, newMovement]);
  };

  const handleLinesChange = (movementId: number, updatedLines: any[]) => {
    setMovements(
      movements.map((movement) =>
        movement.id === movementId
          ? { ...movement, lines: updatedLines }
          : movement,
      ),
    );
  };

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
              {movements.map((movement) => (
                <SumTable
                  key={movement.id}
                  title={movement.title}
                  lines={movement.lines}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Botón de ejemplo para agregar más en el futuro */}
        <div className="flex pt-8">
          <Button
            variant="default"
            size="lg"
            onClick={handleNewMovement}
            className="hover:cursor-pointer"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Movimiento
          </Button>
        </div>
      </div>
    </div>
  );
}

export default App;
