"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { getAuditoria, type EntradaAuditoria, type AcaoAuditoria } from "@/lib/auditoria";
import { Shield, ChevronDown, ChevronUp } from "lucide-react";

const ENTIDADES = ["Todos", "Cliente", "Cardápio", "Pedido", "Financeiro", "Consignado"];

const acaoLabel: Record<AcaoAuditoria, string> = {
  "cliente.criado": "Cliente criado",
  "cliente.editado": "Cliente editado",
  "sabor.criado": "Sabor criado",
  "sabor.editado": "Sabor editado",
  "sabor.removido": "Sabor removido",
  "sabores.salvos": "Cardápio salvo",
  "pedido.status": "Status alterado",
  "pedido.cancelado": "Pedido cancelado",
  "lancamento.criado": "Lançamento criado",
  "lancamento.editado": "Lançamento editado",
  "lancamento.removido": "Lançamento removido",
  "consignado.envio": "Envio registrado",
  "consignado.fechado": "Consignado fechado",
  "empresa.criada": "Empresa criada",
  "empresa.editada": "Empresa editada",
};

const acaoCor: Partial<Record<AcaoAuditoria, string>> = {
  "cliente.criado": "text-emerald-400",
  "empresa.criada": "text-emerald-400",
  "sabor.criado": "text-emerald-400",
  "lancamento.criado": "text-emerald-400",
  "consignado.envio": "text-blue-400",
  "pedido.cancelado": "text-red-400",
  "lancamento.removido": "text-red-400",
  "sabor.removido": "text-red-400",
  "consignado.fechado": "text-amber-400",
};

function dataHora(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function AuditoriaPage() {
  const [entradas, setEntradas] = useState<EntradaAuditoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [entidade, setEntidade] = useState("Todos");
  const [expandido, setExpandido] = useState<string | null>(null);

  useEffect(() => {
    getAuditoria().then((data) => { setEntradas(data); setLoading(false); });
  }, []);

  const filtradas = entidade === "Todos"
    ? entradas
    : entradas.filter((e) => e.entidade === entidade);

  return (
    <AdminLayout>
      <div className="px-8 py-8 max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-5 h-5 text-amber-400" />
          <h1 className="text-xl font-semibold">Auditoria</h1>
          <span className="text-sm text-neutral-500 ml-auto">{filtradas.length} registros</span>
        </div>

        {/* Filtro por entidade */}
        <div className="flex gap-2 flex-wrap mb-6">
          {ENTIDADES.map((e) => (
            <button
              key={e}
              onClick={() => setEntidade(e)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                entidade === e
                  ? "bg-amber-500 text-neutral-950"
                  : "bg-neutral-800 text-neutral-400 hover:text-neutral-200"
              }`}
            >
              {e}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-neutral-900 animate-pulse" />
            ))}
          </div>
        ) : filtradas.length === 0 ? (
          <p className="text-sm text-neutral-500 text-center py-16">Nenhum registro encontrado</p>
        ) : (
          <div className="space-y-2">
            {filtradas.map((entrada) => {
              const temDetalhes = entrada.antes || entrada.depois;
              const aberto = expandido === entrada.id;
              return (
                <div key={entrada.id} className="rounded-xl border border-neutral-800 bg-neutral-900 overflow-hidden">
                  <div
                    className={`flex items-start gap-4 px-5 py-4 ${temDetalhes ? "cursor-pointer hover:bg-neutral-800/40 transition" : ""}`}
                    onClick={() => temDetalhes && setExpandido(aberto ? null : entrada.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className={`text-xs font-medium ${acaoCor[entrada.acao] ?? "text-neutral-300"}`}>
                          {acaoLabel[entrada.acao]}
                        </span>
                        <span className="text-xs text-neutral-600">·</span>
                        <span className="text-xs text-neutral-500">{entrada.entidade}</span>
                      </div>
                      <p className="text-sm text-neutral-200 leading-snug">{entrada.descricao}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-neutral-500 whitespace-nowrap">{dataHora(entrada.criadoEm)}</span>
                      {temDetalhes && (
                        <span className="text-neutral-600">
                          {aberto ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </span>
                      )}
                    </div>
                  </div>

                  {aberto && temDetalhes && (
                    <div className="border-t border-neutral-800 px-5 py-3 grid grid-cols-2 gap-4">
                      {entrada.antes && (
                        <div>
                          <p className="text-xs text-neutral-500 mb-1.5 font-medium">Antes</p>
                          <pre className="text-xs text-neutral-400 bg-neutral-800 rounded-lg p-3 overflow-auto max-h-40 whitespace-pre-wrap">
                            {JSON.stringify(entrada.antes, null, 2)}
                          </pre>
                        </div>
                      )}
                      {entrada.depois && (
                        <div>
                          <p className="text-xs text-neutral-500 mb-1.5 font-medium">Depois</p>
                          <pre className="text-xs text-neutral-400 bg-neutral-800 rounded-lg p-3 overflow-auto max-h-40 whitespace-pre-wrap">
                            {JSON.stringify(entrada.depois, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
