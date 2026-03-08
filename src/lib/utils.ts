// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formato de moneda para México (con $ y separadores de miles)
export function formatCurrency(value: number | string): string {
  // Convertir a número y manejar posibles strings vacíos o no numéricos
  const num = typeof value === "string" ? parseFloat(value.replace(/[^0-9.-]+/g, "")) : value
  
  if (isNaN(num) || num === 0) return "—"

  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)
}