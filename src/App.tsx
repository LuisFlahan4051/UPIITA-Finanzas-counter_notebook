import { AccountingTable } from "./components/AccountingTable";
import { movementsData } from "./data/movements";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">
            Registro de Movimientos Contables
          </h1>
          <Button variant="default" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Movimiento
          </Button>
        </div>

        {/* Grid de tablas */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {movementsData.map((movement) => (
            <AccountingTable
              key={movement.id}
              title={movement.title}
              lines={movement.lines}
            />
          ))}
        </div>

        {/* Botón de ejemplo para agregar más en el futuro */}
        <div className="flex justify-center pt-8">
          <Button variant="outline" size="lg">
            Cargar más movimientos
          </Button>
        </div>
      </div>
    </div>
  );
}

export default App;
