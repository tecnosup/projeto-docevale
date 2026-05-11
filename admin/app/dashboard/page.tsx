"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { getPedidos } from "@/lib/pedidos";
import { getLancamentos } from "@/lib/financeiro";
import { getConsignados } from "@/lib/consignado";
import type { Pedido, LancamentoFinanceiro, Consignado } from "@/lib/types";
import { ShoppingBag, TrendingUp, Building2, AlertCircle } from "lucide-react";
import Link from "next/link";

function fmt(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function DashboardPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [lancamentos, setLancamentos] = useState<LancamentoFinanceiro[]>([]);
  const [consignados, setConsignados] = useState<Consignado[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getPedidos(), getLancamentos(), getConsignados()]).then(
      ([p, l, c]) => {
        setPedidos(p);
        setLancamentos(l);
        setConsignados(c);
        setLoading(false);
      }
    );
  }, []);

  const hoje = new Date().toISOString().slice(0, 10);
  const pedidosHoje = pedidos.filter((p) => p.criadoEm.startsWith(hoje));
  const pedidosAtivos = pedidos.filter((p) => ["novo", "preparando"].includes(p.status));
  const faturamentoHoje = lancamentos
    .filter((l) => l.tipo === "entrada" && l.data === hoje)
    .reduce((s, l) => s + l.valor, 0);
  const totalMes = lancamentos
    .filter((l) => l.tipo === "entrada" && l.data.startsWith(hoje.slice(0, 7)))
    .reduce((s, l) => s + l.valor, 0);
  const consignadoAberto = consignados
    .filter((c) => c.status !== "fechado")
    .reduce((s, c) => s + c.valorAberto, 0);

  return (
    <AdminLayout>
      <div className="px-8 py-8">
        <h1 className="text-xl font-semibold mb-6">Visão geral</h1>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 rounded-xl bg-neutral-900 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Cards de resumo */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard
                icon={<ShoppingBag className="w-4 h-4" />}
                label="Pedidos hoje"
                value={String(pedidosHoje.length)}
                sub={`${pedidosAtivos.length} em andamento`}
                href="/pedidos"
              />
              <StatCard
                icon={<TrendingUp className="w-4 h-4" />}
                label="Faturamento hoje"
                value={fmt(faturamentoHoje)}
                sub={`${fmt(totalMes)} no mês`}
                href="/financeiro"
              />
              <StatCard
                icon={<Building2 className="w-4 h-4" />}
                label="Consignado aberto"
                value={fmt(consignadoAberto)}
                sub={`${consignados.filter((c) => c.status !== "fechado").length} empresas`}
                href="/consignado"
              />
              <StatCard
                icon={<AlertCircle className="w-4 h-4" />}
                label="Novos pedidos"
                value={String(pedidos.filter((p) => p.status === "novo").length)}
                sub="aguardando preparo"
                href="/pedidos"
                alert={pedidos.some((p) => p.status === "novo")}
              />
            </div>

            {/* Pedidos recentes */}
            <div className="bg-neutral-900 rounded-xl border border-neutral-800">
              <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800">
                <h2 className="font-medium text-sm">Pedidos recentes</h2>
                <Link href="/pedidos" className="text-xs text-amber-400 hover:text-amber-300">
                  Ver todos →
                </Link>
              </div>
              <div className="divide-y divide-neutral-800">
                {pedidos.slice(0, 5).map((p) => (
                  <div key={p.id} className="flex items-center justify-between px-5 py-3.5">
                    <div>
                      <p className="text-sm font-medium">{p.clienteNome}</p>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        {p.itens.map((i) => `${i.quantidade}× ${i.nome}`).join(", ")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{fmt(p.total)}</p>
                      <StatusBadge status={p.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}

function StatCard({
  icon, label, value, sub, href, alert,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  href: string;
  alert?: boolean;
}) {
  return (
    <Link
      href={href}
      className="block rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 p-5 transition"
    >
      <div className={`flex items-center gap-2 text-xs mb-3 ${alert ? "text-amber-400" : "text-neutral-400"}`}>
        {icon}
        {label}
      </div>
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-xs text-neutral-500 mt-1">{sub}</p>
    </Link>
  );
}

const statusConfig: Record<string, { label: string; cls: string }> = {
  novo: { label: "Novo", cls: "bg-amber-500/15 text-amber-400" },
  preparando: { label: "Preparando", cls: "bg-blue-500/15 text-blue-400" },
  pronto: { label: "Pronto", cls: "bg-emerald-500/15 text-emerald-400" },
  entregue: { label: "Entregue", cls: "bg-neutral-700 text-neutral-400" },
  cancelado: { label: "Cancelado", cls: "bg-red-500/15 text-red-400" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] ?? statusConfig.novo;
  return (
    <span className={`inline-block text-xs rounded-full px-2 py-0.5 font-medium mt-1 ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}
