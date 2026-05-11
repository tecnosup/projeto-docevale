import type { Cliente } from "./types";
import { registrar } from "./auditoria";

const dias = (n: number) => new Date(Date.now() - n * 86400000).toISOString();

let store: Cliente[] = [
  { id: "c1", nome: "Ana Paula", telefone: "12991234567", email: "ana@email.com", totalPedidos: 2, totalGasto: 92, ultimoPedidoEm: new Date().toISOString(), criadoEm: dias(30) },
  { id: "c2", nome: "Marcos Souza", telefone: "12998765432", totalPedidos: 1, totalGasto: 40, ultimoPedidoEm: new Date().toISOString(), criadoEm: dias(10) },
  { id: "c3", nome: "Fernanda Lima", telefone: "12993456789", email: "fernanda@email.com", totalPedidos: 1, totalGasto: 72, ultimoPedidoEm: dias(1), criadoEm: dias(20) },
];

export async function getClientes(): Promise<Cliente[]> {
  await delay(300);
  return clone(store);
}

export async function getCliente(id: string): Promise<Cliente | null> {
  await delay(200);
  return clone(store.find((c) => c.id === id) ?? null);
}

export async function upsertCliente(
  data: Omit<Cliente, "id" | "totalPedidos" | "totalGasto" | "criadoEm"> & { id?: string }
): Promise<Cliente> {
  await delay(300);
  const existing = store.find((c) => c.id === data.id);
  if (existing) {
    const antes = clone(existing) as Record<string, unknown>;
    Object.assign(existing, { nome: data.nome, telefone: data.telefone, email: data.email });
    const depois = clone(existing) as Record<string, unknown>;
    registrar("cliente.editado", "Cliente", `Cliente ${existing.nome} editado`, antes, depois);
    return clone(existing);
  }
  const novo: Cliente = { ...data, id: `c${Date.now()}`, totalPedidos: 0, totalGasto: 0, criadoEm: new Date().toISOString() };
  store = [novo, ...store];
  registrar("cliente.criado", "Cliente", `Cliente ${novo.nome} cadastrado`, undefined, { nome: novo.nome, telefone: novo.telefone });
  return clone(novo);
}

function delay(ms: number) { return new Promise((r) => setTimeout(r, ms)); }
function clone<T>(v: T): T { return JSON.parse(JSON.stringify(v)); }
