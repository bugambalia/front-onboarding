import type { CargoJerarquia } from "@/types/auth";

const ENCARGADO_KEYWORDS = [
  "encargado",
  "jefe",
  "coordinador",
  "supervisor",
  "lider",
  "líder",
  "analista",
  "inventario",
  "oficinas",
  "rrhh",
  "recursos humanos",
];

export function getEncargadoCargos(cargos: CargoJerarquia[]): CargoJerarquia[] {
  const filtered = cargos.filter((cargo) => {
    const nombre = (cargo.nombre_cargo ?? "").toLowerCase();
    return ENCARGADO_KEYWORDS.some((keyword) => nombre.includes(keyword));
  });

  return filtered.length > 0 ? filtered : cargos;
}
