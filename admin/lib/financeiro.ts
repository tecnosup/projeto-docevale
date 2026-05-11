import type { LancamentoFinanceiro } from "./types";
import { registrar } from "./auditoria";

const dias = (n: number) => new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);

let store: LancamentoFinanceiro[] = [
  { id: "f1", tipo: "entrada", categoria: "pedido", descricao: "Pedido Ana Paula", valor: 36, data: dias(0), referencia: "p1" },
  { id: "f2", tipo: "entrada", categoria: "pedido", descricao: "Pedido Marcos Souza", valor: 40, data: dias(0), referencia: "p2" },
  { id: "f3", tipo: "entrada", categoria: "pedido", descricao: "Pedido Fernanda Lima", valor: 72, data: dias(1), referencia: "p3" },
  { id: "f4", tipo: "entrada", categoria: "consignado", descricao: "Acerto Mercadinho do Bairro", valor: 168, data: dias(2), referencia: "cs1" },
  { id: "f5", tipo: "saida", categoria: "ingredientes", descricao: "Chocolate e farinha", valor: 85, data: dias(3) },
  { id: "f6", tipo: "saida", categoria: "embalagem", descricao: "Caixas e fitilho", valor: 32, data: dias(5) },
  { id: "f7", tipo: "entrada", categoria: "pedido", descricao: "Pedido Ana Paula", valor: 56, data: dias(3), referencia: "p4" },
  { id: "f8", tipo: "saida", categoria: "ingredientes", descricao: "Doce de leite e leite Ninho", valor: 60, data: dias(7) },
  { id: "f9", tipo: "entrada", categoria: "consignado", descricao: "Acerto Salão Beleza Total", valor: 185, data: dias(2), referencia: "cs2" },
  { id: "f10", tipo: "saida", categoria: "outros", descricao: "Gás", valor: 15, data: dias(10) },
];

export async function getLancamentos(): Promise<LancamentoFinanceiro[]> {
  await delay(300);
  return clone(store);
}

export async function adicionarLancamento(data: Omit<LancamentoFinanceiro, "id">): Promise<LancamentoFinanceiro> {
  await delay(300);
  const novo: LancamentoFinanceiro = { ...data, id: `f${Date.now()}` };
  store = [novo, ...store];
  registrar("lancamento.criado", "Financeiro", `Lançamento criado: ${data.descricao} — R$ ${data.valor.toFixed(2)}`, undefined, { tipo: data.tipo, valor: data.valor, categoria: data.categoria });
  return clone(novo);
}

export async function editarLancamento(id: string, patch: Partial<Pick<LancamentoFinanceiro, "descricao" | "valor" | "data" | "categoria">>): Promise<void> {
  await delay(300);
  const lancamento = store.find((l) => l.id === id);
  if (!lancamento) return;
  const antes = clone(lancamento) as Record<string, unknown>;
  Object.assign(lancamento, patch);
  registrar("lancamento.editado", "Financeiro", `Lançamento editado: ${lancamento.descricao}`, antes, clone(lancamento) as Record<string, unknown>);
}

export async function removerLancamento(id: string): Promise<void> {
  await delay(200);
  const lancamento = store.find((l) => l.id === id);
  if (lancamento) {
    registrar("lancamento.removido", "Financeiro", `Lançamento removido: ${lancamento.descricao} — R$ ${lancamento.valor.toFixed(2)}`, clone(lancamento) as Record<string, unknown>);
  }
  store = store.filter((l) => l.id !== id);
}

function delay(ms: number) { return new Promise((r) => setTimeout(r, ms)); }
function clone<T>(v: T): T { return JSON.parse(JSON.stringify(v)); }
