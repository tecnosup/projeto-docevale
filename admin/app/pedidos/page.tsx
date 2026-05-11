"use client";

import { useEffect, useState, useCallback } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { getPedidos, atualizarStatus, onPedidosChange } from "@/lib/pedidos";
import type { Pedido, StatusPedido } from "@/lib/types";
import { ChevronRight, Phone } from "lucide-react";

const COLUNAS: { status: StatusPedido; label: string; cor: string }[] = [
  { status: "novo", label: "Novos", cor: "text-amber-400" },
  { status: "preparando", label: "Preparando", cor: "text-blue-400" },
  { status: "pronto", label: "Prontos", cor: "text-emerald-400" },
  { status: "entregue", label: "Entregues", cor: "text-neutral-400" },
];

function fmt(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function hora(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

const PROXIMO: Record<StatusPedido, StatusPedido | null> = {
  novo: "preparando",
  preparando: "pronto",
  pronto: "entregue",
  entregue: null,
  cancelado: null,
};

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [atualizando, setAtualizando] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    const data = await getPedidos();
    setPedidos(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    carregar();
    return onPedidosChange(carregar);
  }, [carregar]);

  async function avancar(pedido: Pedido) {
    const proximo = PROXIMO[pedido.status];
    if (!proximo) return;
    setAtualizando(pedido.id);
    await atualizarStatus(pedido.id, proximo);
    setAtualizando(null);
  }

  async function cancelar(id: string) {
    setAtualizando(id);
    await atualizarStatus(id, "cancelado");
    setAtualizando(null);
  }

  return (
    <AdminLayout>
      <div className="px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold">Pedidos</h1>
          <span className="text-sm text-neutral-500">
            {pedidos.filter((p) => !["entregue", "cancelado"].includes(p.status)).length} ativos
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 rounded-xl bg-neutral-900 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {COLUNAS.map(({ status, label, cor }) => {
              const col = pedidos.filter((p) => p.status === status);
              return (
                <div key={status} className="bg-neutral-900 rounded-xl border border-neutral-800">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
                    <span className={`text-sm font-medium ${cor}`}>{label}</span>
                    <span className="text-xs bg-neutral-800 rounded-full px-2 py-0.5 text-neutral-400">
                      {col.length}
                    </span>
                  </div>
                  <div className="p-3 space-y-3 min-h-32">
                    {col.length === 0 && (
                      <p className="text-xs text-neutral-600 text-center pt-4">Nenhum</p>
                    )}
                    {col.map((p) => (
                      <div key={p.id} className="rounded-lg bg-neutral-800 border border-neutral-700 p-3">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className="text-sm font-medium leading-tight">{p.clienteNome}</p>
                          <span className="text-xs text-neutral-500 shrink-0">{hora(p.criadoEm)}</span>
                        </div>
                        <ul className="text-xs text-neutral-400 space-y-0.5 mb-2">
                          {p.itens.map((it, i) => (
                            <li key={i}>{it.quantidade}× {it.nome}</li>
                          ))}
                        </ul>
                        {p.observacao && (
                          <p className="text-xs text-amber-400/80 bg-amber-500/10 rounded px-2 py-1 mb-2">
                            {p.observacao}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm font-semibold">{fmt(p.total)}</span>
                          <div className="flex items-center gap-1">
                            <a
                              href={`https://wa.me/55${p.clienteTelefone}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg text-neutral-500 hover:text-emerald-400 hover:bg-emerald-400/10 transition"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                            {PROXIMO[p.status] && (
                              <button
                                onClick={() => avancar(p)}
                                disabled={atualizando === p.id}
                                className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 disabled:opacity-50 transition"
                              >
                                {atualizando === p.id ? "…" : PROXIMO[p.status]}
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                        {p.status === "novo" && (
                          <button
                            onClick={() => cancelar(p.id)}
                            disabled={atualizando === p.id}
                            className="mt-2 w-full text-xs text-red-400/60 hover:text-red-400 transition"
                          >
                            Cancelar pedido
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
