// Mock sabores — troca por Firebase quando tiver o projeto criado
import { registrar } from "./auditoria";
import type { Sabor } from "./types";

export type { Sabor };

export const SABORES_INICIAIS: Sabor[] = [
  { id: "doce-de-leite", nome: "Doce de Leite", descricao: "Recheio de doce de leite escorrendo no meio", preco: 12, disponivel: true, tipo: "fixo" },
  { id: "leite-ninho", nome: "Leite Ninho", descricao: "Recheio cremoso de leite em pó", preco: 13, disponivel: true, tipo: "rotativo" },
  { id: "nutella", nome: "Nutella", descricao: "Avelã e chocolate ao leite", preco: 14, disponivel: false, tipo: "rotativo" },
  { id: "kitkat", nome: "KitKat", descricao: "Wafer crocante com chocolate ao leite", preco: 14, disponivel: false, tipo: "rotativo" },
];

let store: Sabor[] = structuredClone(SABORES_INICIAIS);
const listeners = new Set<(s: Sabor[]) => void>();

export async function getSabores(): Promise<Sabor[]> {
  await delay(300);
  return structuredClone(store);
}

export async function setSabores(sabores: Sabor[]): Promise<void> {
  await delay(500);
  const antes = structuredClone(store);
  store = structuredClone(sabores);
  listeners.forEach((fn) => fn(structuredClone(store)));
  const disponiveis = sabores.filter((s) => s.disponivel).map((s) => s.nome).join(", ") || "nenhum";
  registrar(
    "sabores.salvos",
    "Cardápio",
    `Cardápio atualizado — disponíveis: ${disponiveis}`,
    { sabores: antes } as Record<string, unknown>,
    { sabores } as Record<string, unknown>
  );
}

export function onSaboresChange(callback: (sabores: Sabor[]) => void) {
  listeners.add(callback);
  return () => { listeners.delete(callback); };
}

function delay(ms: number) { return new Promise((r) => setTimeout(r, ms)); }
