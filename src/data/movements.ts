import data from "./accounting_accounts.json";

// ======================
// TIPOS
// ======================
export type NaturalezaSaldo = "deudora" | "acreedora";
export type Categoria1 = "balance" | "resultados" | "auxiliar";
export type Categoria2 =
  | "activo"
  | "pasivo"
  | "capital"
  | "ingreso"
  | "egreso"
  | "auxiliar";
export type TipoCuenta = "circulante" | "fijo" | "contra_activo" | "diferido";

export interface Cuenta {
  id: string;
  nombre: string;
  naturaleza_saldo: NaturalezaSaldo;
  descripcion: string;
  categoria1: Categoria1;
  categoria2: Categoria2;
  tipo?: TipoCuenta; // solo aplica en activos y pasivos
}

// ======================
// FORMA DEL JSON
// (capital, ingresos y egresos son arreglos directos; el resto usa { cuentas, descripcion })
// ======================
type CuentaJson = Pick<Cuenta, "nombre" | "naturaleza_saldo" | "descripcion">;
type GrupoJson = { cuentas: CuentaJson[]; descripcion: string };
type Lista = CuentaJson[];

interface DatosJson {
  cuentas_contables: {
    cuentas_de_balance: Record<string, Lista | Record<string, GrupoJson>>;
    cuentas_de_resultados: Record<string, Lista>;
    auxiliares?: GrupoJson;
  };
}

const raw = (data as unknown as DatosJson).cuentas_contables;

// ======================
// NORMALIZACIÓN DE LLAVES DEL JSON
// ======================
const CATEGORIA2: Record<string, Categoria2> = {
  activos: "activo",
  pasivos: "pasivo",
  capital: "capital",
  ingresos: "ingreso",
  egresos: "egreso",
};

const TIPO: Record<string, TipoCuenta> = {
  circulantes: "circulante",
  fijos: "fijo",
  contra_activos: "contra_activo",
  diferido: "diferido"
};

// "Almacén de Materia Prima" -> "almacen_de_materia_prima"
const slug = (s: string): string =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const mapear = (
  lista: CuentaJson[],
  extra: Pick<Cuenta, "categoria1" | "categoria2"> & { tipo?: TipoCuenta }
): Cuenta[] =>
  lista.map((c) => ({
    id: slug(c.nombre),
    nombre: c.nombre,
    naturaleza_saldo: c.naturaleza_saldo,
    descripcion: c.descripcion,
    ...extra,
  }));

// ======================
// CONSTRUCCIÓN DINÁMICA
// ======================
const balance = Object.entries(raw.cuentas_de_balance).flatMap(
  ([llave, valor]) => {
    const categoria2 = CATEGORIA2[llave];
    // capital: arreglo directo, sin tipo
    if (Array.isArray(valor)) {
      return mapear(valor, { categoria1: "balance", categoria2 });
    }
    // activos / pasivos: un grupo por tipo. Un grupo auxiliar puede vivir
    // dentro de activos y conserva su propia categoría contable.
    return Object.entries(valor).flatMap(([llaveTipo, grupo]) => {
      if (llaveTipo === "auxiliares") {
        return mapear(grupo.cuentas, {
          categoria1: "auxiliar",
          categoria2: "auxiliar",
        });
      }

      return mapear(grupo.cuentas, {
        categoria1: "balance",
        categoria2,
        tipo: TIPO[llaveTipo],
      });
    });
  }
);

const resultados = Object.entries(raw.cuentas_de_resultados).flatMap(
  ([llave, lista]) =>
    mapear(lista, { categoria1: "resultados", categoria2: CATEGORIA2[llave] })
);

const auxiliares = raw.auxiliares
  ? mapear(raw.auxiliares.cuentas, {
      categoria1: "auxiliar",
      categoria2: "auxiliar",
    })
  : [];

export const cuentas: Cuenta[] = [...balance, ...resultados, ...auxiliares];

// ======================
// HELPERS OPCIONALES
// ======================
export const cuentaPorId = (id: string): Cuenta | undefined =>
  cuentas.find((c) => c.id === id);

export const filtrarCuentas = (f: Partial<Omit<Cuenta, "id" | "nombre" | "descripcion">>): Cuenta[] =>
  cuentas.filter((c) => Object.entries(f).every(([k, v]) => c[k as keyof Cuenta] === v));

export type AccountType =
  | "Activo"
  | "Pasivo"
  | "Capital"
  | "Ingreso"
  | "Egreso"
  | "Auxiliar";
export type AccountConcept = string;

export interface MovementLine {
  concepto: AccountConcept;
  type: AccountType;
  naturaleza_saldo?: NaturalezaSaldo;
  tipo_cuenta?: TipoCuenta;
  cargo: number | "";
  abono: number | "";
}

export interface Movement {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  lines: MovementLine[];
}

const tipoPorCategoria: Record<Categoria2, AccountType> = {
  activo: "Activo",
  pasivo: "Pasivo",
  capital: "Capital",
  ingreso: "Ingreso",
  egreso: "Egreso",
  auxiliar: "Auxiliar",
};

export const cuentaPorNombre = (nombre: string): Cuenta | undefined =>
  cuentas.find((cuenta) => cuenta.nombre === nombre);

export const accountTypeForCuenta = (cuenta: Cuenta): AccountType =>
  tipoPorCategoria[cuenta.categoria2];

export const cuentaInicialActiva = (() => {
  const cuenta = cuentas.find((item) => item.categoria2 === "activo");
  if (!cuenta) {
    throw new Error("El catálogo no contiene cuentas de activo.");
  }
  return cuenta;
})();

export const accountsTypes: Record<AccountType, AccountConcept[]> = {
  Activo: cuentas
    .filter((cuenta) => cuenta.categoria2 === "activo")
    .map((cuenta) => cuenta.nombre),
  Pasivo: cuentas
    .filter((cuenta) => cuenta.categoria2 === "pasivo")
    .map((cuenta) => cuenta.nombre),
  Capital: cuentas
    .filter((cuenta) => cuenta.categoria2 === "capital")
    .map((cuenta) => cuenta.nombre),
  Ingreso: cuentas
    .filter((cuenta) => cuenta.categoria2 === "ingreso")
    .map((cuenta) => cuenta.nombre),
  Egreso: cuentas
    .filter((cuenta) => cuenta.categoria2 === "egreso")
    .map((cuenta) => cuenta.nombre),
  Auxiliar: cuentas
    .filter((cuenta) => cuenta.categoria2 === "auxiliar")
    .map((cuenta) => cuenta.nombre),
};

export const movementsData: Movement[] = [];