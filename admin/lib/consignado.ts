import type { Empresa, Consignado, StatusConsignado } from "./types";
import { registrar } from "./auditoria";

const dias = (n: number) => new Date(Date.now() - n * 86400000).toISOString();

let empresas: Empresa[] = [
  { id: "e1", nome: "Mercadinho do Bairro", contato: "Carlos", telefone: "12997001122", endereco: "Rua das Flores, 45", ativa: true },
  { id: "e2", nome: "Salão Beleza Total", contato: "Patricia", telefone: "12996003344", ativa: true },
  { id: "e3", nome: "Escritório Central", contato: "Roberto", telefone: "12994005566", endereco: "Av. Brasil, 200", ativa: false },
];

let consignados: Consignado[] = [
  { id: "cs1", empresaId: "e1", empresaNome: "Mercadinho do Bairro", itens: [{ saborId: "doce-de-leite", nome: "Doce de Leite", quantidade: 20, precoUnit: 12 }], totalEnviado: 20, totalVendido: 14, totalDevolvido: 0, valorAberto: 168, status: "parcial", dataEnvio: dias(7) },
  { id: "cs2", empresaId: "e2", empresaNome: "Salão Beleza Total", itens: [{ saborId: "doce-de-leite", nome: "Doce de Leite", quantidade: 10, precoUnit: 12 }, { saborId: "leite-ninho", nome: "Leite Ninho", quantidade: 5, precoUnit: 13 }], totalEnviado: 15, totalVendido: 15, totalDevolvido: 0, valorAberto: 185, status: "fechado", dataEnvio: dias(14), dataFechamento: dias(2) },
];

export async function getEmpresas(): Promise<Empresa[]> {
  await delay(300);
  return clone(empresas);
}

export async function salvarEmpresa(data: Omit<Empresa, "id"> & { id?: string }): Promise<Empresa> {
  await delay(300);
  if (data.id) {
    const antes = clone(empresas.find((e) => e.id === data.id)) as Record<string, unknown>;
    empresas = empresas.map((e) => e.id === data.id ? { ...e, ...data } as Empresa : e);
    const depois = clone(empresas.find((e) => e.id === data.id)) as Record<string, unknown>;
    registrar("empresa.editada", "Consignado", `Empresa ${data.nome} editada`, antes, depois);
    return clone(empresas.find((e) => e.id === data.id)!);
  }
  const nova: Empresa = { ...data, id: `e${Date.now()}` };
  empresas = [nova, ...empresas];
  registrar("empresa.criada", "Consignado", `Empresa ${nova.nome} cadastrada`, undefined, { nome: nova.nome, telefone: nova.telefone });
  return clone(nova);
}

export async function getConsignados(): Promise<Consignado[]> {
  await delay(300);
  return clone(consignados);
}

export async function salvarConsignado(data: Omit<Consignado, "id"> & { id?: string }): Promise<Consignado> {
  await delay(400);
  if (data.id) {
    consignados = consignados.map((c) => c.id === data.id ? { ...c, ...data } as Consignado : c);
    return clone(consignados.find((c) => c.id === data.id)!);
  }
  const novo: Consignado = { ...data, id: `cs${Date.now()}` };
  consignados = [novo, ...consignados];
  registrar("consignado.envio", "Consignado", `Novo envio para ${novo.empresaNome} — ${novo.totalEnviado} unidades`, undefined, { empresa: novo.empresaNome, total: novo.totalEnviado, valor: novo.valorAberto });
  return clone(novo);
}

export async function fecharConsignado(id: string, vendido: number, devolvido: number): Promise<void> {
  await delay(400);
  consignados = consignados.map((c) => {
    if (c.id !== id) return c;
    const status: StatusConsignado = devolvido > 0 ? "parcial" : "fechado";
    const valorFinal = vendido * (c.valorAberto / c.totalEnviado);
    registrar("consignado.fechado", "Consignado", `Consignado ${c.empresaNome} fechado — ${vendido} vendidas, R$ ${valorFinal.toFixed(2)}`, { status: c.status }, { status, vendido, devolvido, valor: valorFinal });
    return { ...c, totalVendido: vendido, totalDevolvido: devolvido, valorAberto: valorFinal, status, dataFechamento: new Date().toISOString() };
  });
}

function delay(ms: number) { return new Promise((r) => setTimeout(r, ms)); }
function clone<T>(v: T): T { return JSON.parse(JSON.stringify(v)); }
