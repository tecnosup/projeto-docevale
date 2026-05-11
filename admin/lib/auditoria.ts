export type AcaoAuditoria =
  | "cliente.criado"
  | "cliente.editado"
  | "sabor.criado"
  | "sabor.editado"
  | "sabor.removido"
  | "sabores.salvos"
  | "pedido.status"
  | "pedido.cancelado"
  | "lancamento.criado"
  | "lancamento.editado"
  | "lancamento.removido"
  | "consignado.envio"
  | "consignado.fechado"
  | "empresa.criada"
  | "empresa.editada";

export type EntradaAuditoria = {
  id: string;
  acao: AcaoAuditoria;
  entidade: string;
  descricao: string;
  antes?: Record<string, unknown>;
  depois?: Record<string, unknown>;
  criadoEm: string;
};

const dias = (n: number) => new Date(Date.now() - n * 3600000 * 24).toISOString();
const horas = (n: number) => new Date(Date.now() - n * 3600000).toISOString();

let store: EntradaAuditoria[] = [
  {
    id: "a1",
    acao: "sabores.salvos",
    entidade: "Cardápio",
    descricao: "Cardápio atualizado: Doce de Leite disponível, Nutella indisponível",
    criadoEm: horas(2),
  },
  {
    id: "a2",
    acao: "consignado.envio",
    entidade: "Consignado",
    descricao: "Novo envio para Mercadinho do Bairro — 20 unidades",
    depois: { empresa: "Mercadinho do Bairro", total: 20, valor: 240 },
    criadoEm: dias(7),
  },
  {
    id: "a3",
    acao: "pedido.status",
    entidade: "Pedido",
    descricao: 'Status do pedido de Ana Paula alterado para "entregue"',
    antes: { status: "pronto" },
    depois: { status: "entregue" },
    criadoEm: dias(1),
  },
  {
    id: "a4",
    acao: "cliente.criado",
    entidade: "Cliente",
    descricao: "Cliente Fernanda Lima cadastrado",
    depois: { nome: "Fernanda Lima", telefone: "12993456789" },
    criadoEm: dias(20),
  },
  {
    id: "a5",
    acao: "lancamento.criado",
    entidade: "Financeiro",
    descricao: "Lançamento de saída: Chocolate e farinha — R$ 85,00",
    depois: { tipo: "saida", valor: 85, categoria: "ingredientes" },
    criadoEm: dias(3),
  },
  {
    id: "a6",
    acao: "consignado.fechado",
    entidade: "Consignado",
    descricao: "Consignado Salão Beleza Total fechado — 15 vendidas, R$ 185,00 recebido",
    depois: { empresa: "Salão Beleza Total", vendido: 15, valor: 185 },
    criadoEm: dias(2),
  },
];

export async function getAuditoria(): Promise<EntradaAuditoria[]> {
  await delay(300);
  return clone(store);
}

export function registrar(
  acao: AcaoAuditoria,
  entidade: string,
  descricao: string,
  antes?: Record<string, unknown>,
  depois?: Record<string, unknown>
): void {
  const entrada: EntradaAuditoria = {
    id: `a${Date.now()}`,
    acao,
    entidade,
    descricao,
    antes,
    depois,
    criadoEm: new Date().toISOString(),
  };
  store = [entrada, ...store];
}

function delay(ms: number) { return new Promise((r) => setTimeout(r, ms)); }
function clone<T>(v: T): T { return JSON.parse(JSON.stringify(v)); }
