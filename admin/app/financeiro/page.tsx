"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { getLancamentos, adicionarLancamento, editarLancamento, removerLancamento } from "@/lib/financeiro";
import type { LancamentoFinanceiro } from "@/lib/types";
import { Plus, Trash2, TrendingUp, TrendingDown, Pencil, X } from "lucide-react";

function fmt(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const CATEGORIAS_ENTRADA = ["pedido", "consignado", "outros"];
const CATEGORIAS_SAIDA = ["ingredientes", "embalagem", "transporte", "outros"];

type Periodo = "semana" | "mes" | "total";

type ModalLancamento = {
  id?: string;
  tipo: "entrada" | "saida";
  categoria: string;
  descricao: string;
  valor: string;
  data: string;
};

export default function FinanceiroPage() {
  const [lancamentos, setLancamentos] = useState<LancamentoFinanceiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState<Periodo>("mes");
  const [modal, setModal] = useState<ModalLancamento | null>(null);
  const [saving, setSaving] = useState(false);

  const hoje = new Date().toISOString().slice(0, 10);

  async function carregar() {
    const data = await getLancamentos();
    setLancamentos(data);
    setLoading(false);
  }

  useEffect(() => { carregar(); }, []);

  function filtrar(l: LancamentoFinanceiro[]) {
    const agora = new Date();
    if (periodo === "semana") {
      const ini = new Date(agora); ini.setDate(ini.getDate() - 7);
      return l.filter((x) => new Date(x.data) >= ini);
    }
    if (periodo === "mes") {
      const mes = agora.toISOString().slice(0, 7);
      return l.filter((x) => x.data.startsWith(mes));
    }
    return l;
  }

  const filtrados = filtrar(lancamentos);
  const entradas = filtrados.filter((l) => l.tipo === "entrada").reduce((s, l) => s + l.valor, 0);
  const saidas = filtrados.filter((l) => l.tipo === "saida").reduce((s, l) => s + l.valor, 0);
  const lucro = entradas - saidas;

  function abrirNovo() {
    setModal({ tipo: "entrada", categoria: "pedido", descricao: "", valor: "", data: hoje });
  }

  function abrirEdicao(l: LancamentoFinanceiro) {
    setModal({ id: l.id, tipo: l.tipo, categoria: l.categoria, descricao: l.descricao, valor: String(l.valor), data: l.data });
  }

  async function handleSalvar() {
    if (!modal) return;
    setSaving(true);
    if (modal.id) {
      await editarLancamento(modal.id, {
        descricao: modal.descricao,
        valor: parseFloat(modal.valor) || 0,
        data: modal.data,
        categoria: modal.categoria,
      });
    } else {
      await adicionarLancamento({
        tipo: modal.tipo,
        categoria: modal.categoria,
        descricao: modal.descricao,
        valor: parseFloat(modal.valor) || 0,
        data: modal.data,
      });
    }
    setModal(null);
    setSaving(false);
    carregar();
  }

  async function handleRemover(id: string) {
    await removerLancamento(id);
    carregar();
  }

  return (
    <AdminLayout>
      <div className="px-8 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold">Financeiro</h1>
          <button
            onClick={abrirNovo}
            className="flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 px-4 py-2 text-sm font-semibold text-neutral-950 transition"
          >
            <Plus className="w-4 h-4" />
            Lançamento
          </button>
        </div>

        <div className="flex rounded-lg overflow-hidden border border-neutral-800 text-sm w-fit mb-6">
          {(["semana", "mes", "total"] as Periodo[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriodo(p)}
              className={`px-4 py-2 transition ${periodo === p ? "bg-neutral-800 text-neutral-100" : "text-neutral-500 hover:text-neutral-300"}`}
            >
              {p === "semana" ? "7 dias" : p === "mes" ? "Este mês" : "Tudo"}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="rounded-xl bg-neutral-900 border border-neutral-800 p-4">
            <div className="flex items-center gap-2 text-xs text-emerald-400 mb-2">
              <TrendingUp className="w-3.5 h-3.5" /> Entradas
            </div>
            <p className="text-2xl font-semibold text-emerald-400">{fmt(entradas)}</p>
          </div>
          <div className="rounded-xl bg-neutral-900 border border-neutral-800 p-4">
            <div className="flex items-center gap-2 text-xs text-red-400 mb-2">
              <TrendingDown className="w-3.5 h-3.5" /> Saídas
            </div>
            <p className="text-2xl font-semibold text-red-400">{fmt(saidas)}</p>
          </div>
          <div className="rounded-xl bg-neutral-900 border border-neutral-800 p-4">
            <p className="text-xs text-neutral-400 mb-2">Lucro</p>
            <p className={`text-2xl font-semibold ${lucro >= 0 ? "text-amber-400" : "text-red-400"}`}>
              {fmt(lucro)}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-14 rounded-xl bg-neutral-900 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="bg-neutral-900 rounded-xl border border-neutral-800 divide-y divide-neutral-800">
            {filtrados.length === 0 && (
              <p className="text-sm text-neutral-500 text-center py-10">Nenhum lançamento no período</p>
            )}
            {filtrados
              .sort((a, b) => b.data.localeCompare(a.data))
              .map((l) => (
                <div key={l.id} className="flex items-center gap-4 px-5 py-3.5">
                  <span className={`text-lg ${l.tipo === "entrada" ? "text-emerald-400" : "text-red-400"}`}>
                    {l.tipo === "entrada" ? "+" : "−"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{l.descricao}</p>
                    <p className="text-xs text-neutral-500">{l.categoria} · {new Date(l.data + "T00:00:00").toLocaleDateString("pt-BR")}</p>
                  </div>
                  <p className={`text-sm font-semibold shrink-0 ${l.tipo === "entrada" ? "text-emerald-400" : "text-red-400"}`}>
                    {fmt(l.valor)}
                  </p>
                  {!l.referencia && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => abrirEdicao(l)}
                        className="p-1.5 text-neutral-600 hover:text-neutral-300 hover:bg-neutral-800 rounded-lg transition"
                        title="Editar"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleRemover(l.id)}
                        className="p-1.5 text-neutral-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition"
                        title="Remover"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4" onClick={() => setModal(null)}>
          <div className="bg-neutral-900 rounded-2xl border border-neutral-800 w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">{modal.id ? "Editar lançamento" : "Novo lançamento"}</h3>
              <button onClick={() => setModal(null)} className="text-neutral-500 hover:text-neutral-300">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 mb-5">
              {!modal.id && (
                <div className="flex rounded-lg overflow-hidden border border-neutral-700 text-sm">
                  {(["entrada", "saida"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setModal((m) => m && ({ ...m, tipo: t, categoria: t === "entrada" ? "pedido" : "ingredientes" }))}
                      className={`flex-1 py-2 capitalize transition ${modal.tipo === t ? "bg-neutral-700 text-neutral-100" : "text-neutral-500 hover:text-neutral-300"}`}
                    >
                      {t === "entrada" ? "Entrada" : "Saída"}
                    </button>
                  ))}
                </div>
              )}
              <div>
                <label className="text-xs text-neutral-400 block mb-1">Categoria</label>
                <select
                  value={modal.categoria}
                  onChange={(e) => setModal((m) => m && ({ ...m, categoria: e.target.value }))}
                  className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                >
                  {(modal.tipo === "entrada" ? CATEGORIAS_ENTRADA : CATEGORIAS_SAIDA).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-neutral-400 block mb-1">Descrição</label>
                <input
                  value={modal.descricao}
                  onChange={(e) => setModal((m) => m && ({ ...m, descricao: e.target.value }))}
                  placeholder="Ex: Compra de chocolate"
                  className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-neutral-400 block mb-1">Valor (R$)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={modal.valor}
                    onChange={(e) => setModal((m) => m && ({ ...m, valor: e.target.value }))}
                    className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-neutral-400 block mb-1">Data</label>
                  <input
                    type="date"
                    value={modal.data}
                    onChange={(e) => setModal((m) => m && ({ ...m, data: e.target.value }))}
                    className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
            <button
              onClick={handleSalvar}
              disabled={saving || !modal.descricao || !modal.valor}
              className="w-full rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 py-2.5 text-sm font-semibold text-neutral-950"
            >
              {saving ? "Salvando…" : modal.id ? "Salvar alterações" : "Adicionar"}
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
