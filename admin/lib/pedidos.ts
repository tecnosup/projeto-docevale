import type { Pedido, StatusPedido } from "./types";
import { registrar } from "./auditoria";

const now = () => new Date().toISOString();
const dias = (n: number) => new Date(Date.now() - n * 86400000).toISOString();

let store: Pedido[] = [
  { id: "p1", clienteId: "c1", clienteNome: "Ana Paula", clienteTelefone: "12991234567", itens: [{ saborId: "doce-de-leite", nome: "Doce de Leite", quantidade: 3, precoUnit: 12 }], total: 36, status: "novo", criadoEm: now(), atualizadoEm: now() },
  { id: "p2", clienteId: "c2", clienteNome: "Marcos Souza", clienteTelefone: "12998765432", itens: [{ saborId: "leite-ninho", nome: "Leite Ninho", quantidade: 2, precoUnit: 13 }, { saborId: "nutella", nome: "Nutella", quantidade: 1, precoUnit: 14 }], total: 40, status: "preparando", observacao: "Sem açúcar no de Nutella", criadoEm: dias(0), atualizadoEm: dias(0) },
  { id: "p3", clienteId: "c3", clienteNome: "Fernanda Lima", clienteTelefone: "12993456789", itens: [{ saborId: "doce-de-leite", nome: "Doce de Leite", quantidade: 6, precoUnit: 12 }], total: 72, status: "entregue", criadoEm: dias(1), atualizadoEm: dias(1) },
  { id: "p4", clienteId: "c1", clienteNome: "Ana Paula", clienteTelefone: "12991234567", itens: [{ saborId: "kitkat", nome: "KitKat", quantidade: 4, precoUnit: 14 }], total: 56, status: "entregue", criadoEm: dias(3), atualizadoEm: dias(3) },
];

const listeners = new Set<() => void>();
function notify() { listeners.forEach((fn) => fn()); }

export async function getPedidos(): Promise<Pedido[]> {
  await delay(300);
  return clone(store);
}

export async function atualizarStatus(id: string, status: StatusPedido): Promise<void> {
  await delay(300);
  const pedido = store.find((p) => p.id === id);
  if (!pedido) return;
  const statusAnterior = pedido.status;
  store = store.map((p) => p.id === id ? { ...p, status, atualizadoEm: now() } : p);
  notify();
  const acao = status === "cancelado" ? "pedido.cancelado" : "pedido.status";
  registrar(acao, "Pedido", `Status do pedido de ${pedido.clienteNome} alterado para "${status}"`, { status: statusAnterior }, { status });
}

export async function criarPedido(pedido: Omit<Pedido, "id" | "criadoEm" | "atualizadoEm">): Promise<Pedido> {
  await delay(400);
  const novo: Pedido = { ...pedido, id: `p${Date.now()}`, criadoEm: now(), atualizadoEm: now() };
  store = [novo, ...store];
  notify();
  registrar("pedido.status", "Pedido", `Novo pedido de ${novo.clienteNome} — R$ ${novo.total.toFixed(2)}`, undefined, { cliente: novo.clienteNome, total: novo.total });
  return clone(novo);
}

export function onPedidosChange(callback: () => void): () => void {
  listeners.add(callback);
  return () => { listeners.delete(callback); };
}

function delay(ms: number) { return new Promise((r) => setTimeout(r, ms)); }
function clone<T>(v: T): T { return JSON.parse(JSON.stringify(v)); }
