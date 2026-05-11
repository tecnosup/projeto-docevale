"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { getSabores, setSabores } from "@/lib/sabores";
import type { Sabor } from "@/lib/types";
import { Plus, Save, Trash2, RefreshCw, Check } from "lucide-react";

type SaveState = "idle" | "saving" | "saved";

const NOVO_SABOR: Omit<Sabor, "id"> = {
  nome: "",
  descricao: "",
  preco: 12,
  disponivel: true,
  tipo: "rotativo",
};

export default function CardapioPage() {
  const [sabores, setSaboresState] = useState<Sabor[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [editando, setEditando] = useState<string | null>(null);

  useEffect(() => {
    getSabores().then((data) => {
      setSaboresState(data);
      setLoading(false);
    });
  }, []);

  function update(id: string, patch: Partial<Sabor>) {
    setSaboresState((prev) => prev.map((s) => s.id === id ? { ...s, ...patch } : s));
  }

  function adicionar() {
    const id = `sabor-${Date.now()}`;
    setSaboresState((prev) => [...prev, { ...NOVO_SABOR, id }]);
    setEditando(id);
  }

  function remover(id: string) {
    setSaboresState((prev) => prev.filter((s) => s.id !== id));
    if (editando === id) setEditando(null);
  }

  async function salvar() {
    setSaveState("saving");
    await setSabores(sabores);
    setSaveState("saved");
    setTimeout(() => setSaveState("idle"), 2000);
  }

  return (
    <AdminLayout>
      <div className="px-8 py-8 max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold">Cardápio</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={adicionar}
              className="flex items-center gap-1.5 rounded-lg border border-neutral-700 hover:border-neutral-600 px-3 py-2 text-sm text-neutral-300 transition"
            >
              <Plus className="w-4 h-4" />
              Novo sabor
            </button>
            <button
              onClick={salvar}
              disabled={saveState === "saving"}
              className="flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-60 px-4 py-2 text-sm font-semibold text-neutral-950 transition"
            >
              {saveState === "saving" && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              {saveState === "saved" && <Check className="w-3.5 h-3.5" />}
              {saveState === "idle" && <Save className="w-3.5 h-3.5" />}
              {saveState === "saving" ? "Salvando…" : saveState === "saved" ? "Salvo!" : "Salvar"}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-neutral-900 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {sabores.map((s) => (
              <div
                key={s.id}
                className="rounded-xl border border-neutral-800 bg-neutral-900 overflow-hidden"
              >
                {/* Header do card */}
                <div
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-neutral-800/50 transition"
                  onClick={() => setEditando(editando === s.id ? null : s.id)}
                >
                  {/* Toggle disponível */}
                  <button
                    onClick={(e) => { e.stopPropagation(); update(s.id, { disponivel: !s.disponivel }); }}
                    className={`shrink-0 w-10 h-5.5 rounded-full transition-colors ${s.disponivel ? "bg-amber-500" : "bg-neutral-700"}`}
                  >
                    <span className={`block w-3.5 h-3.5 rounded-full bg-white shadow transition-transform m-px ${s.disponivel ? "translate-x-5" : "translate-x-0"}`} />
                  </button>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{s.nome || <span className="text-neutral-500">Novo sabor</span>}</p>
                    <p className="text-xs text-neutral-500 truncate">{s.descricao || "Sem descrição"}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-xs rounded-full px-2 py-0.5 ${s.tipo === "fixo" ? "bg-neutral-700 text-neutral-300" : "bg-amber-500/10 text-amber-400"}`}>
                      {s.tipo}
                    </span>
                    <span className="text-sm font-medium">R$ {s.preco.toFixed(2)}</span>
                  </div>
                </div>

                {/* Formulário expandido */}
                {editando === s.id && (
                  <div className="border-t border-neutral-800 px-4 py-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-neutral-400 block mb-1">Nome</label>
                        <input
                          value={s.nome}
                          onChange={(e) => update(s.id, { nome: e.target.value })}
                          className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm focus:outline-none focus:border-amber-500 transition"
                          placeholder="Ex: Doce de Leite"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-neutral-400 block mb-1">Preço (R$)</label>
                        <input
                          type="number"
                          min={0}
                          step={0.5}
                          value={s.preco}
                          onChange={(e) => update(s.id, { preco: parseFloat(e.target.value) || 0 })}
                          className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm focus:outline-none focus:border-amber-500 transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-neutral-400 block mb-1">Descrição</label>
                      <input
                        value={s.descricao}
                        onChange={(e) => update(s.id, { descricao: e.target.value })}
                        className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm focus:outline-none focus:border-amber-500 transition"
                        placeholder="Ex: Recheio cremoso de doce de leite"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex rounded-lg overflow-hidden border border-neutral-700 text-xs">
                        {(["fixo", "rotativo"] as const).map((t) => (
                          <button
                            key={t}
                            onClick={() => update(s.id, { tipo: t })}
                            className={`px-3 py-1.5 capitalize transition ${s.tipo === t ? "bg-neutral-700 text-neutral-100" : "text-neutral-500 hover:text-neutral-300"}`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => remover(s.id)}
                        className="flex items-center gap-1.5 text-xs text-red-400/60 hover:text-red-400 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remover
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
