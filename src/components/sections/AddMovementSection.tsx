import { useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AddMovementSection() {
  const [title, setTitle] = useState("");

  const handleAcceptAndClose = async () => {
    // Aqui luego puedes emitir el evento al main window con los datos del formulario.
    await getCurrentWindow().close();
  };
  const handleCancel = async () => {
    // Aqui luego puedes emitir el evento al main window con los datos del formulario.
    await getCurrentWindow().close();
  };

  return (
    <div className="min-h-screen bg-background p-4 text-foreground">
      <Card className="mx-auto mt-2 w-full max-w-xl border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Nuevo Movimiento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="movement-title">
              Titulo
            </label>
            <input
              id="movement-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ej. Compra de mercancia"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={handleAcceptAndClose}
              className="hover:cursor-pointer"
            >
              Aceptar
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              className="hover:cursor-pointer"
            >
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
