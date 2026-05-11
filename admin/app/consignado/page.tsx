"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { getEmpresas, getConsignados, fecharConsignado, salvarConsignado, salvarEmpresa } from "@/lib/consignado";
import { getSabores } from "@/lib/sabores";
import type { Empresa, Consignado, Sabor } from "@/lib/types";
import { Plus, Building2, CheckCircle, Clock, X, ChevronDown, ChevronUp, Pencil } from "lucide-react";

function fmt(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function dataFmt(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR");
}

type Aba = "envios" | "empresas";
type ModalFechamento = { consignado: Consignado; vendido: number; devolvido: number } | null;
type ModalNovoEnvio = { empresaId: string; itens: { saborId: string; nome: string; quantidade: number; precoUnit: number }[] } | null;
type ModalEmpresa = { id?: string; nome: string; contato: string; telefone: string; endereco: string; ativa: boolean };

export default function ConsignadoPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [consignados, setConsignados] = useState<Consignado[]>([]);
  const [sabores, setSabores] = useState<Sabor[]>([]);
  const [loading, setLoading] = useState(true);
  const [aba, setAba] = useState<Aba>("envios");
  const [modalFechamento, setModalFechamento] = useState<ModalFechamento>(null);
  const [modalEnvio, setModalEnvio] = useState<ModalNovoEnvio>(null);
  const [modalEmpresa, setModalEmpresa] = useState<ModalEmpresa | null>(null);
  const [saving, setSaving] = useState(false);
  const [erroEmpresa, setErroEmpresa] = useState("");

  async function carregar() {
    const [e, c, s] = await Promise.all([getEmpresas(), getConsignados(), getSabores()]);
    setEmpresas(e);
    setConsignados(c);
    setSabores(s);
    setLoading(false);
  }

  useEffect(() => { carregar(); }, []);

  function abrirModalEmpresa(empresa?: Empresa) {
    setErroEmpresa("");
    setModalEmpresa(
      empresa
        ? { id: empresa.id, nome: empresa.nome, contato: empresa.contato, telefone: empresa.telefone, endereco: empresa.endereco ?? "", ativa: empresa.ativa }
        : { nome: "", contato: "", telefone: "", endereco: "", ativa: true }
    );
  }

  async function handleSalvarEmpresa() {
    if (!modalEmpresa) return;
    if (!modalEmpresa.nome.trim()) { setErroEmpresa("Nome é obrigatório."); return; }
    if (!modalEmpresa.telefone.trim()) { setErroEmpresa("Telefone é obrigatório."); return; }
    setSaving(true);
    await salvarEmpresa({
      id: modalEmpresa.id,
      nome: modalEmpresa.nome.trim(),
      contato: modalEmpresa.contato.trim(),
      telefone: modalEmpresa.telefone.trim(),
      endereco: modalEmpresa.endereco.trim() || undefined,
      ativa: modalEmpresa.ativa,
    });
    setModalEmpresa(null);
    setSaving(false);
    carregar();
  }

  async function handleFechar() {
    if (!modalFechamento) return;
    setSaving(true);
    await fecharConsignado(modalFechamento.consignado.id, modalFechamento.vendido, modalFechamento.devolvido);
    setModalFechamento(null);
    setSaving(false);
    carregar();
  }

  async function handleNovoEnvio() {
    if (!modalEnvio) return;
    setSaving(true);
    const empresa = empresas.find((e) => e.id === modalEnvio.empresaId)!;
    const totalEnviado = modalEnvio.itens.reduce((s, i) => s + i.quantidade, 0);
    const valorAberto = modalEnvio.itens.reduce((s, i) => s + i.quantidade * i.precoUnit, 0);
    await salvarConsignado({
      empresaId: empresa.id,
      empresaNome: empresa.nome,
      itens: modalEnvio.itens,
      totalEnviado,
      totalVendido: 0,
      totalDevolvido: 0,
      valorAberto,
      status: "aberto",
      dataEnvio: new Date().toISOString(),
    });
    setModalEnvio(null);
    setSaving(false);
    carregar();
  }

  const abertos = consignados.filter((c) => c.status !== "fechado");
  const fechados = consignados.filter((c) => c.status === "fechado");
  const totalAberto = abertos.reduce((s, c) => s + c.valorAberto, 0);
  const empresasAtivas = empresas.filter((e) => e.ativa);

  return (
    <AdminLayout>
      <div className="px-8 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold">Consignado</h1>
            <p className="text-sm text-neutral-500 mt-0.5">
              {fmt(totalAberto)} em aberto · {abertos.length} envio{abertos.length !== 1 ? "s" : ""} ativos
            </p>
          </div>
          <div className="flex items-center gap-2">
            {aba === "envios" ? (
              <button
                onClick={() => empresasAtivas.length > 0 && setModalEnvio({ empresaId: empresasAtivas[0].id, itens: [] })}
                disabled={empresasAtivas.length === 0}
                title={empresasAtivas.length === 0 ? "Cadastre uma empresa primeiro" : undefined}
                className="flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2 text-sm font-semibold text-neutral-950 transition"
              >
                <Plus className="w-4 h-4" />
                Novo envio
              </button>
            ) : (
              <button
                onClick={() => abrirModalEmpresa()}
                className="flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 px-4 py-2 text-sm font-semibold text-neutral-950 transition"
              >
                <Plus className="w-4 h-4" />
                Nova empresa
              </button>
            )}
          </div>
        </div>

        {/* Abas */}
        <div className="flex rounded-lg overflow-hidden border border-neutral-800 text-sm w-fit mb-6">
          {([["envios", "Envios"], ["empresas", "Empresas"]] as [Aba, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setAba(key)}
              className={`px-4 py-2 transition ${aba === key ? "bg-neutral-800 text-neutral-100" : "text-neutral-500 hover:text-neutral-300"}`}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 rounded-xl bg-neutral-900 animate-pulse" />
            ))}
          </div>
        ) : aba === "envios" ? (
          <>
            {abertos.length === 0 && fechados.length === 0 && (
              <div className="text-center py-12">
                <p className="text-sm text-neutral-500">Nenhum envio registrado</p>
                {empresasAtivas.length > 0 && (
                  <button
                    onClick={() => setModalEnvio({ empresaId: empresasAtivas[0].id, itens: [] })}
                    className="mt-3 text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 mx-auto"
                  >
                    <Plus className="w-3.5 h-3.5" /> Registrar primeiro envio
                  </button>
                )}
              </div>
            )}
            {abertos.length > 0 && (
              <section className="mb-6">
                <h2 className="text-sm font-medium text-neutral-400 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Em aberto
                </h2>
                <div className="space-y-3">
                  {abertos.map((c) => (
                    <ConsignadoCard
                      key={c.id}
                      consignado={c}
                      onFechar={() => setModalFechamento({ consignado: c, vendido: c.totalEnviado - c.totalDevolvido, devolvido: 0 })}
                    />
                  ))}
                </div>
              </section>
            )}
            {fechados.length > 0 && (
              <section>
                <h2 className="text-sm font-medium text-neutral-400 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Fechados
                </h2>
                <div className="space-y-3">
                  {fechados.slice(0, 10).map((c) => (
                    <ConsignadoCard key={c.id} consignado={c} />
                  ))}
                </div>
              </section>
            )}
          </>
        ) : (
          /* Aba empresas */
          <div className="space-y-3">
            {empresas.length === 0 && (
              <div className="text-center py-12">
                <p className="text-sm text-neutral-500">Nenhuma empresa cadastrada</p>
                <button onClick={() => abrirModalEmpresa()} className="mt-3 text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 mx-auto">
                  <Plus className="w-3.5 h-3.5" /> Cadastrar primeira empresa
                </button>
              </div>
            )}
            {empresas.map((e) => (
              <div key={e.id} className="rounded-xl border border-neutral-800 bg-neutral-900 px-5 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-4 h-4 text-neutral-500 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{e.nome}</p>
                      <p className="text-xs text-neutral-500">{e.contato} · {e.telefone}</p>
                      {e.endereco && <p className="text-xs text-neutral-600 mt-0.5">{e.endereco}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs rounded-full px-2.5 py-1 font-medium ${e.ativa ? "bg-emerald-500/10 text-emerald-400" : "bg-neutral-800 text-neutral-500"}`}>
                      {e.ativa ? "Ativa" : "Inativa"}
                    </span>
                    <button
                      onClick={() => abrirModalEmpresa(e)}
                      className="p-1.5 text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800 rounded-lg transition"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal fechamento */}
      {modalFechamento && (
        <Modal title="Fechar consignado" onClose={() => setModalFechamento(null)}>
          <p className="text-sm text-neutral-400 mb-4">{modalFechamento.consignado.empresaNome}</p>
          <div className="space-y-3 mb-5">
            <div>
              <label className="text-xs text-neutral-400 block mb-1">Unidades vendidas</label>
              <input
                type="number"
                min={0}
                max={modalFechamento.consignado.totalEnviado}
                value={modalFechamento.vendido}
                onChange={(e) => setModalFechamento((m) => m && ({ ...m, vendido: parseInt(e.target.value) || 0 }))}
                className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-xs text-neutral-400 block mb-1">Unidades devolvidas</label>
              <input
                type="number"
                min={0}
                value={modalFechamento.devolvido}
                onChange={(e) => setModalFechamento((m) => m && ({ ...m, devolvido: parseInt(e.target.value) || 0 }))}
                className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
          <button
            onClick={handleFechar}
            disabled={saving}
            className="w-full rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 py-2.5 text-sm font-semibold text-neutral-950"
          >
            {saving ? "Salvando…" : "Confirmar fechamento"}
          </button>
        </Modal>
      )}

      {/* Modal novo envio */}
      {modalEnvio && (
        <Modal title="Novo envio" onClose={() => setModalEnvio(null)}>
          <div className="space-y-3 mb-5">
            <div>
              <label className="text-xs text-neutral-400 block mb-1">Empresa</label>
              <select
                value={modalEnvio.empresaId}
                onChange={(e) => setModalEnvio((m) => m && ({ ...m, empresaId: e.target.value }))}
                className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
              >
                {empresasAtivas.map((e) => (
                  <option key={e.id} value={e.id}>{e.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-neutral-400 block mb-2">Sabores e quantidades</label>
              <div className="space-y-2">
                {sabores.map((s) => {
                  const item = modalEnvio.itens.find((i) => i.saborId === s.id);
                  return (
                    <div key={s.id} className="flex items-center gap-3">
                      <span className="flex-1 text-sm">{s.nome}</span>
                      <input
                        type="number"
                        min={0}
                        placeholder="0"
                        value={item?.quantidade ?? ""}
                        onChange={(e) => {
                          const qty = parseInt(e.target.value) || 0;
                          setModalEnvio((m) => {
                            if (!m) return m;
                            const itens = m.itens.filter((i) => i.saborId !== s.id);
                            if (qty > 0) itens.push({ saborId: s.id, nome: s.nome, quantidade: qty, precoUnit: s.preco });
                            return { ...m, itens };
                          });
                        }}
                        className="w-20 rounded-lg bg-neutral-800 border border-neutral-700 px-2 py-1.5 text-sm text-center focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <button
            onClick={handleNovoEnvio}
            disabled={saving || modalEnvio.itens.length === 0}
            className="w-full rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 py-2.5 text-sm font-semibold text-neutral-950"
          >
            {saving ? "Salvando…" : "Registrar envio"}
          </button>
        </Modal>
      )}

      {/* Modal empresa */}
      {modalEmpresa && (
        <Modal
          title={modalEmpresa.id ? "Editar empresa" : "Nova empresa"}
          onClose={() => setModalEmpresa(null)}
        >
          <div className="space-y-3 mb-5">
            <div>
              <label className="text-xs text-neutral-400 block mb-1">Nome da empresa *</label>
              <input
                value={modalEmpresa.nome}
                onChange={(e) => setModalEmpresa((m) => m && ({ ...m, nome: e.target.value }))}
                placeholder="Ex: Mercadinho do Bairro"
                className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm focus:outline-none focus:border-amber-500 transition"
              />
            </div>
            <div>
              <label className="text-xs text-neutral-400 block mb-1">Nome do contato</label>
              <input
                value={modalEmpresa.contato}
                onChange={(e) => setModalEmpresa((m) => m && ({ ...m, contato: e.target.value }))}
                placeholder="Ex: Carlos"
                className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm focus:outline-none focus:border-amber-500 transition"
              />
            </div>
            <div>
              <label className="text-xs text-neutral-400 block mb-1">Telefone / WhatsApp *</label>
              <input
                value={modalEmpresa.telefone}
                onChange={(e) => setModalEmpresa((m) => m && ({ ...m, telefone: e.target.value }))}
                placeholder="12999998888"
                className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm focus:outline-none focus:border-amber-500 transition"
              />
            </div>
            <div>
              <label className="text-xs text-neutral-400 block mb-1">Endereço (opcional)</label>
              <input
                value={modalEmpresa.endereco}
                onChange={(e) => setModalEmpresa((m) => m && ({ ...m, endereco: e.target.value }))}
                placeholder="Rua das Flores, 45"
                className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm focus:outline-none focus:border-amber-500 transition"
              />
            </div>
            {modalEmpresa.id && (
              <div className="flex items-center justify-between rounded-lg bg-neutral-800 px-3 py-2.5">
                <span className="text-sm">Empresa ativa</span>
                <button
                  onClick={() => setModalEmpresa((m) => m && ({ ...m, ativa: !m.ativa }))}
                  className={`w-10 h-5 rounded-full transition-colors ${modalEmpresa.ativa ? "bg-amber-500" : "bg-neutral-600"}`}
                >
                  <span className={`block w-3.5 h-3.5 rounded-full bg-white shadow transition-transform m-px ${modalEmpresa.ativa ? "translate-x-5" : "translate-x-0"}`} />
                </button>
              </div>
            )}
            {erroEmpresa && (
              <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{erroEmpresa}</p>
            )}
          </div>
          <button
            onClick={handleSalvarEmpresa}
            disabled={saving}
            className="w-full rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 py-2.5 text-sm font-semibold text-neutral-950 transition"
          >
            {saving ? "Salvando…" : modalEmpresa.id ? "Salvar alterações" : "Cadastrar empresa"}
          </button>
        </Modal>
      )}
    </AdminLayout>
  );
}

function ConsignadoCard({ consignado: c, onFechar }: { consignado: Consignado; onFechar?: () => void }) {
  const [expandido, setExpandido] = useState(false);
  const statusCfg = {
    aberto: "text-amber-400 bg-amber-500/10",
    parcial: "text-blue-400 bg-blue-500/10",
    fechado: "text-neutral-400 bg-neutral-800",
  }[c.status];

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-neutral-500 shrink-0" />
          <div>
            <p className="text-sm font-medium">{c.empresaNome}</p>
            <p className="text-xs text-neutral-500">{dataFmt(c.dataEnvio)} → {dataFmt(c.dataFechamento)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs rounded-full px-2.5 py-1 font-medium capitalize ${statusCfg}`}>{c.status}</span>
          <button onClick={() => setExpandido((v) => !v)} className="text-neutral-500 hover:text-neutral-300 transition">
            {expandido ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-lg bg-neutral-800 py-2">
          <p className="text-sm font-semibold">{c.totalEnviado}</p>
          <p className="text-xs text-neutral-500">enviado</p>
        </div>
        <div className="rounded-lg bg-neutral-800 py-2">
          <p className="text-sm font-semibold">{c.totalVendido}</p>
          <p className="text-xs text-neutral-500">vendido</p>
        </div>
        <div className="rounded-lg bg-neutral-800 py-2">
          <p className="text-sm font-semibold text-amber-400">{fmt(c.valorAberto)}</p>
          <p className="text-xs text-neutral-500">a receber</p>
        </div>
      </div>

      {expandido && (
        <div className="mt-3 border-t border-neutral-800 pt-3 space-y-1">
          {c.itens.map((it, i) => (
            <div key={i} className="flex justify-between text-xs text-neutral-400">
              <span>{it.nome}</span>
              <span>{it.quantidade}× R$ {it.precoUnit.toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}

      {onFechar && (
        <button
          onClick={onFechar}
          className="mt-3 w-full text-xs text-amber-400 hover:text-amber-300 border border-amber-400/20 hover:border-amber-400/40 rounded-lg py-1.5 transition"
        >
          Fechar consignado
        </button>
      )}
    </div>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4" onClick={onClose}>
      <div className="bg-neutral-900 rounded-2xl border border-neutral-800 w-full max-w-sm p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">{title}</h3>
          <button onClick={onClose} className="text-neutral-500 hover:text-neutral-300">
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
