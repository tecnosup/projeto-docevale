export type Sabor = {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  disponivel: boolean;
  tipo: "fixo" | "rotativo";
  foto?: string;
};

export type ItemPedido = {
  saborId: string;
  nome: string;
  quantidade: number;
  precoUnit: number;
};

export type StatusPedido = "novo" | "preparando" | "pronto" | "entregue" | "cancelado";

export type Pedido = {
  id: string;
  clienteId: string;
  clienteNome: string;
  clienteTelefone: string;
  itens: ItemPedido[];
  total: number;
  status: StatusPedido;
  observacao?: string;
  criadoEm: string; // ISO
  atualizadoEm: string;
};

export type Cliente = {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
  totalPedidos: number;
  totalGasto: number;
  ultimoPedidoEm?: string;
  criadoEm: string;
};

export type Empresa = {
  id: string;
  nome: string;
  contato: string;
  telefone: string;
  endereco?: string;
  ativa: boolean;
};

export type ItemConsignado = {
  saborId: string;
  nome: string;
  quantidade: number;
  precoUnit: number;
};

export type StatusConsignado = "aberto" | "parcial" | "fechado";

export type Consignado = {
  id: string;
  empresaId: string;
  empresaNome: string;
  itens: ItemConsignado[];
  totalEnviado: number;
  totalVendido: number;
  totalDevolvido: number;
  valorAberto: number;
  status: StatusConsignado;
  dataEnvio: string;
  dataFechamento?: string;
};

export type LancamentoFinanceiro = {
  id: string;
  tipo: "entrada" | "saida";
  categoria: string;
  descricao: string;
  valor: number;
  data: string;
  referencia?: string; // pedidoId ou consignadoId
};
