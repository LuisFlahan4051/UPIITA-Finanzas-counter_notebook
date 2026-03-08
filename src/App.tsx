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
import { Plus, FileDown, FileUp, FileJson } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { save, open } from "@tauri-apps/plugin-dialog";

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

  const handleExportToExcel = async () => {
    try {
      // Mostrar diálogo de guardar archivo
      const filePath = await save({
        defaultPath: "movimientos_contables.xlsx",
        filters: [
          {
            name: "Excel",
            extensions: ["xlsx"],
          },
        ],
      });

      if (!filePath) return; // Usuario canceló

      // Enviar datos a Rust para generar Excel
      await invoke("export_to_excel", {
        movements: movements,
        summaries: conceptSummaries,
        filePath: filePath,
      });

      alert("Excel generado exitosamente");
    } catch (error) {
      console.error("Error al exportar:", error);
      alert("Error al generar el Excel: " + error);
    }
  };

  const handleExportToJSON = async () => {
    try {
      // Mostrar diálogo de guardar archivo
      const filePath = await save({
        defaultPath: "movimientos_contables.json",
        filters: [
          {
            name: "JSON",
            extensions: ["json"],
          },
        ],
      });

      if (!filePath) return; // Usuario canceló

      // Crear objeto con movimientos y sumas
      const exportData = {
        movements: movements,
        summaries: conceptSummaries,
      };

      // Convertir a JSON con formato
      const jsonContent = JSON.stringify(exportData, null, 2);

      // Guardar archivo
      await invoke("write_json_file", {
        content: jsonContent,
        filePath: filePath,
      });

      alert("JSON exportado exitosamente");
    } catch (error) {
      console.error("Error al exportar JSON:", error);
      alert("Error al generar el JSON: " + error);
    }
  };

  const handleImportFromJSON = async () => {
    try {
      // Mostrar diálogo de abrir archivo
      const filePath = await open({
        multiple: false,
        filters: [
          {
            name: "JSON/TypeScript",
            extensions: ["json", "ts"],
          },
        ],
      });

      if (!filePath) return; // Usuario canceló

      // Leer archivo
      const content = await invoke<string>("read_json_file", {
        filePath: filePath,
      });

      // Si es archivo .ts, intentar extraer el JSON
      let jsonContent = content;
      if (typeof filePath === "string" && filePath.endsWith(".ts")) {
        // Buscar el array de movementsData en archivos TypeScript
        const movementsMatch = content.match(
          /export\s+const\s+movementsData\s*:\s*Movement\[\]\s*=\s*(\[[\s\S]*?\]);/,
        );
        if (movementsMatch) {
          jsonContent = movementsMatch[1];
        } else {
          throw new Error(
            "No se encontró el array movementsData en el archivo TypeScript",
          );
        }
      }

      // Parsear JSON
      const importedData = JSON.parse(jsonContent);

      // Si es un objeto con la propiedad movements, usar esa
      const importedMovements = importedData.movements
        ? importedData.movements
        : Array.isArray(importedData)
          ? importedData
          : [];

      if (importedMovements.length === 0) {
        throw new Error("No se encontraron movimientos en el archivo");
      }

      // Actualizar estado (las sumas se regeneran automáticamente)
      setMovements(importedMovements);

      alert(
        `Importados ${importedMovements.length} movimiento(s) exitosamente`,
      );
    } catch (error) {
      console.error("Error al importar:", error);
      alert("Error al importar el archivo: " + error);
    }
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
          <h2>App creada por: Ing. Melendez Bustamante Luis Fernando.</h2>
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
          <Button
            variant="outline"
            size="lg"
            onClick={handleExportToExcel}
            className="hover:cursor-pointer"
          >
            <FileDown className="mr-2 h-4 w-4" />
            Exportar a Excel
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={handleExportToJSON}
            className="hover:cursor-pointer"
          >
            <FileJson className="mr-2 h-4 w-4" />
            Exportar JSON
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={handleImportFromJSON}
            className="hover:cursor-pointer"
          >
            <FileUp className="mr-2 h-4 w-4" />
            Importar JSON
          </Button>
        </div>
      </div>
    </div>
  );
}

export default App;
