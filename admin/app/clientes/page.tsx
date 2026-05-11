"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { getClientes, upsertCliente } from "@/lib/clientes";
import type { Cliente } from "@/lib/types";
import { Phone, Search, Plus, X, UserPlus, Pencil } from "lucide-react";

function fmt(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function dataFmt(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR");
}

type ModalCliente = {
  nome: string;
  telefone: string;
  email: string;
};

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [modal, setModal] = useState<ModalCliente | null>(null);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState("");

  async function carregar() {
    const data = await getClientes();
    setClientes(data);
    setLoading(false);
  }

  useEffect(() => { carregar(); }, []);

  function abrirModal(cliente?: Cliente) {
    setErro("");
    if (cliente) {
      setEditandoId(cliente.id);
      setModal({ nome: cliente.nome, telefone: cliente.telefone, email: cliente.email ?? "" });
    } else {
      setEditandoId(null);
      setModal({ nome: "", telefone: "", email: "" });
    }
  }

  async function handleSalvar() {
    if (!modal) return;
    if (!modal.nome.trim()) { setErro("Nome é obrigatório."); return; }
    if (!modal.telefone.trim()) { setErro("Telefone é obrigatório."); return; }
    setSaving(true);
    await upsertCliente({ id: editandoId ?? undefined, nome: modal.nome.trim(), telefone: modal.telefone.trim(), email: modal.email.trim() || undefined });
    setModal(null);
    setSaving(false);
    carregar();
  }

  const filtrados = clientes.filter(
    (c) =>
      c.nome.toLowerCase().includes(busca.toLowerCase()) ||
      c.telefone.includes(busca)
  );

  return (
    <AdminLayout>
      <div className="px-8 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold">Clientes</h1>
          <button
            onClick={() => abrirModal()}
            className="flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 px-4 py-2 text-sm font-semibold text-neutral-950 transition"
          >
            <UserPlus className="w-4 h-4" />
            Novo cliente
          </button>
        </div>

        <div className="relative mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome ou telefone…"
            className="w-full rounded-lg bg-neutral-900 border border-neutral-800 pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 transition"
          />
        </div>

        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-neutral-900 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="bg-neutral-900 rounded-xl border border-neutral-800 divide-y divide-neutral-800">
            {filtrados.length === 0 && (
              <div className="text-center py-12">
                <p className="text-sm text-neutral-500">Nenhum cliente encontrado</p>
                {busca === "" && (
                  <button onClick={() => abrirModal()} className="mt-3 text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 mx-auto">
                    <Plus className="w-3.5 h-3.5" /> Cadastrar primeiro cliente
                  </button>
                )}
              </div>
            )}
            {filtrados.map((c) => (
              <div key={c.id} className="flex items-center justify-between px-5 py-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{c.nome}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">{c.email ?? "Sem e-mail"}</p>
                </div>

                <div className="hidden md:flex items-center gap-8 text-sm mx-6">
                  <div className="text-center">
                    <p className="font-semibold">{c.totalPedidos}</p>
                    <p className="text-xs text-neutral-500">pedidos</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold">{fmt(c.totalGasto)}</p>
                    <p className="text-xs text-neutral-500">total gasto</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-neutral-400">{dataFmt(c.ultimoPedidoEm)}</p>
                    <p className="text-xs text-neutral-500">último pedido</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => abrirModal(c)}
                    className="p-1.5 text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800 rounded-lg transition"
                    title="Editar cliente"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <a
                    href={`https://wa.me/55${c.telefone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 border border-emerald-400/20 hover:border-emerald-400/40 rounded-lg px-3 py-1.5 transition"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    {c.telefone}
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4" onClick={() => setModal(null)}>
          <div className="bg-neutral-900 rounded-2xl border border-neutral-800 w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold">{editandoId ? "Editar cliente" : "Novo cliente"}</h3>
              <button onClick={() => setModal(null)} className="text-neutral-500 hover:text-neutral-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 mb-5">
              <div>
                <label className="text-xs text-neutral-400 block mb-1">Nome *</label>
                <input
                  value={modal.nome}
                  onChange={(e) => setModal((m) => m && ({ ...m, nome: e.target.value }))}
                  placeholder="Nome completo"
                  className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm focus:outline-none focus:border-amber-500 transition"
                />
              </div>
              <div>
                <label className="text-xs text-neutral-400 block mb-1">Telefone / WhatsApp *</label>
                <input
                  value={modal.telefone}
                  onChange={(e) => setModal((m) => m && ({ ...m, telefone: e.target.value }))}
                  placeholder="12999998888"
                  className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm focus:outline-none focus:border-amber-500 transition"
                />
              </div>
              <div>
                <label className="text-xs text-neutral-400 block mb-1">E-mail (opcional)</label>
                <input
                  type="email"
                  value={modal.email}
                  onChange={(e) => setModal((m) => m && ({ ...m, email: e.target.value }))}
                  placeholder="email@exemplo.com"
                  className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm focus:outline-none focus:border-amber-500 transition"
                />
              </div>
              {erro && (
                <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{erro}</p>
              )}
            </div>

            <button
              onClick={handleSalvar}
              disabled={saving}
              className="w-full rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 py-2.5 text-sm font-semibold text-neutral-950 transition"
            >
              {saving ? "Salvando…" : editandoId ? "Salvar alterações" : "Cadastrar cliente"}
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
