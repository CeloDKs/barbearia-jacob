"use client";

import { useEffect, useState, useTransition } from "react";
import QRCode from "qrcode";
import { getDisponibilidade, criarAgendamento } from "@/lib/actions";
import { gerarPixCopiaECola } from "@/lib/pix";
import { formatBRL } from "@/lib/money";
import { maskTelefone, nomeValido, telefoneWhatsappValido, soDigitos } from "@/lib/format";
import { Button, Input, Textarea, Label, Card, cn } from "@/components/ui";

type Barbeiro = { id: string; nome: string; especialidade: string | null; telefone: string | null };
type Item = { id: string; nome: string; preco: number; duracaoMinutos?: number };
type Config = { nomeBarbearia: string; chavePix: string | null; whatsapp: string | null };

type Props = { barbeiros: Barbeiro[]; servicos: Item[]; combos: Item[]; config: Config };

const PASSOS = ["Barbeiro", "Serviços", "Combos", "Data", "Horário", "Seus dados"];

export default function Wizard({ barbeiros, servicos, combos, config }: Props) {
  const [passo, setPasso] = useState(0);
  const [barbeiroId, setBarbeiroId] = useState("");
  const [servicoIds, setServicoIds] = useState<string[]>([]);
  const [comboIds, setComboIds] = useState<string[]>([]);
  const [data, setData] = useState("");
  const [horario, setHorario] = useState("");
  const [slots, setSlots] = useState<{ horario: string; livre: boolean }[]>([]);
  const [carregandoSlots, setCarregandoSlots] = useState(false);

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [obs, setObs] = useState("");
  const [pagamento, setPagamento] = useState<"pix" | "maquininha">("pix");

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [pixCode, setPixCode] = useState("");
  const [pixQr, setPixQr] = useState("");
  const [pending, startTransition] = useTransition();

  const hoje = new Date().toISOString().slice(0, 10);
  const barbeiro = barbeiros.find((b) => b.id === barbeiroId);

  const total =
    servicos.filter((s) => servicoIds.includes(s.id)).reduce((a, s) => a + s.preco, 0) +
    combos.filter((c) => comboIds.includes(c.id)).reduce((a, c) => a + c.preco, 0);

  // Busca horários quando barbeiro + data definidos
  useEffect(() => {
    if (passo === 4 && barbeiroId && data) {
      setCarregandoSlots(true);
      getDisponibilidade(barbeiroId, data)
        .then(setSlots)
        .finally(() => setCarregandoSlots(false));
    }
  }, [passo, barbeiroId, data]);

  function toggle(arr: string[], id: string, set: (v: string[]) => void) {
    set(arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);
  }

  function podeAvancar(): boolean {
    if (passo === 0) return !!barbeiroId;
    if (passo === 1) return servicoIds.length + comboIds.length > 0;
    if (passo === 3) return !!data;
    if (passo === 4) return !!horario;
    return true;
  }

  function finalizar() {
    setErro("");
    if (!nomeValido(nome)) return setErro("Informe nome e sobrenome, sem números.");
    if (!telefoneWhatsappValido(telefone)) return setErro("Telefone (WhatsApp) inválido.");

    startTransition(async () => {
      const res = await criarAgendamento({
        barbeiroId,
        servicoIds,
        comboIds,
        data,
        horario,
        cliente: { nomeCompleto: nome, telefone, email, observacoes: obs },
        formaPagamento: pagamento,
      });
      if (!res.ok) return setErro(res.erro);

      if (pagamento === "pix" && config.chavePix) {
        const code = gerarPixCopiaECola({
          chave: config.chavePix,
          nomeRecebedor: config.nomeBarbearia,
          cidade: "SAO PAULO",
          valorCentavos: res.valorTotal,
          txid: res.agendamentoId.slice(0, 12),
        });
        setPixCode(code);
        QRCode.toDataURL(code, { margin: 1, width: 240 }).then(setPixQr).catch(() => {});
      }
      setSucesso(true);
    });
  }

  function linkWhatsAppBarbeiro(): string {
    const tel = soDigitos(barbeiro?.telefone ?? config.whatsapp ?? "");
    const nomes = [
      ...servicos.filter((s) => servicoIds.includes(s.id)).map((s) => s.nome),
      ...combos.filter((c) => comboIds.includes(c.id)).map((c) => c.nome),
    ].join(", ");
    const msg =
      `*Novo agendamento — Barbearia Jacob*%0A` +
      `Cliente: ${nome}%0A` +
      `Telefone: ${telefone}%0A` +
      `Data: ${data.split("-").reverse().join("/")} às ${horario}%0A` +
      `Serviços: ${nomes}%0A` +
      `Total: ${formatBRL(total)}`;
    return `https://wa.me/${tel}?text=${msg}`;
  }

  // ---------- TELA DE SUCESSO ----------
  if (sucesso) {
    return (
      <Card className="mx-auto max-w-lg text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-3xl">✓</div>
        <h2 className="font-display text-3xl text-ouro">Agendamento confirmado!</h2>
        <p className="mt-2 text-sm text-zinc-400">
          {barbeiro?.nome} · {data.split("-").reverse().join("/")} às {horario}
        </p>
        <p className="mt-1 text-lg font-semibold">{formatBRL(total)}</p>

        {pagamento === "pix" && pixCode ? (
          <div className="mt-6 rounded-lg border border-zinc-800 bg-carvao p-4">
            <p className="mb-3 text-sm font-medium text-ouro">Pague com PIX</p>
            {pixQr && <img src={pixQr} alt="QR Code PIX" className="mx-auto rounded bg-white p-2" />}
            <p className="mt-3 text-xs text-zinc-400">PIX Copia e Cola:</p>
            <textarea
              readOnly
              value={pixCode}
              onClick={(e) => e.currentTarget.select()}
              className="mt-1 h-20 w-full resize-none rounded border border-zinc-700 bg-grafite p-2 text-[11px] text-zinc-300"
            />
            <Button
              variant="outline"
              className="mt-2 w-full"
              onClick={() => navigator.clipboard?.writeText(pixCode)}
            >
              Copiar código PIX
            </Button>
          </div>
        ) : (
          <p className="mt-6 rounded-lg border border-zinc-800 bg-carvao p-4 text-sm text-zinc-300">
            Pagamento na maquininha, presencialmente no dia.
          </p>
        )}

        <a href={linkWhatsAppBarbeiro()} target="_blank" rel="noreferrer">
          <Button className="mt-4 w-full">Avisar a barbearia no WhatsApp</Button>
        </a>
      </Card>
    );
  }

  // ---------- WIZARD ----------
  return (
    <div className="mx-auto max-w-2xl">
      {/* stepper */}
      <div className="mb-8 flex items-center justify-between">
        {PASSOS.map((p, i) => (
          <div key={p} className="flex flex-1 items-center">
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                i <= passo ? "bg-ouro text-carvao" : "bg-zinc-800 text-zinc-500",
              )}
            >
              {i + 1}
            </div>
            {i < PASSOS.length - 1 && <div className={cn("h-0.5 flex-1", i < passo ? "bg-ouro" : "bg-zinc-800")} />}
          </div>
        ))}
      </div>

      <Card>
        <h2 className="mb-4 font-display text-2xl text-zinc-50">{PASSOS[passo]}</h2>

        {passo === 0 && (
          <div className="grid gap-3 sm:grid-cols-2">
            {barbeiros.map((b) => (
              <button
                key={b.id}
                onClick={() => setBarbeiroId(b.id)}
                className={cn(
                  "rounded-lg border p-4 text-left transition",
                  barbeiroId === b.id ? "border-ouro bg-ouro/10" : "border-zinc-700 hover:border-zinc-500",
                )}
              >
                <div className="font-semibold">{b.nome}</div>
                <div className="text-xs text-zinc-400">{b.especialidade}</div>
              </button>
            ))}
          </div>
        )}

        {passo === 1 && (
          <div className="space-y-2">
            {servicos.map((s) => (
              <button
                key={s.id}
                onClick={() => toggle(servicoIds, s.id, setServicoIds)}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg border p-3 text-left transition",
                  servicoIds.includes(s.id) ? "border-ouro bg-ouro/10" : "border-zinc-700 hover:border-zinc-500",
                )}
              >
                <div>
                  <div className="font-medium">{s.nome}</div>
                  <div className="text-xs text-zinc-400">{s.duracaoMinutos} min</div>
                </div>
                <span className="font-semibold text-ouro">{formatBRL(s.preco)}</span>
              </button>
            ))}
          </div>
        )}

        {passo === 2 && (
          <div className="space-y-2">
            {combos.length === 0 && <p className="text-sm text-zinc-400">Nenhum combo disponível. Pode avançar.</p>}
            {combos.map((c) => (
              <button
                key={c.id}
                onClick={() => toggle(comboIds, c.id, setComboIds)}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg border p-3 text-left transition",
                  comboIds.includes(c.id) ? "border-ouro bg-ouro/10" : "border-zinc-700 hover:border-zinc-500",
                )}
              >
                <span className="font-medium">{c.nome}</span>
                <span className="font-semibold text-ouro">{formatBRL(c.preco)}</span>
              </button>
            ))}
          </div>
        )}

        {passo === 3 && (
          <div>
            <Label>Escolha a data</Label>
            <Input type="date" min={hoje} value={data} onChange={(e) => setData(e.target.value)} />
          </div>
        )}

        {passo === 4 && (
          <div>
            {carregandoSlots ? (
              <p className="text-sm text-zinc-400">Carregando horários…</p>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {slots.map((s) => (
                  <button
                    key={s.horario}
                    disabled={!s.livre}
                    onClick={() => setHorario(s.horario)}
                    className={cn(
                      "rounded-md border py-2 text-sm transition",
                      !s.livre && "cursor-not-allowed border-zinc-800 text-zinc-600 line-through",
                      s.livre && horario === s.horario && "border-ouro bg-ouro text-carvao",
                      s.livre && horario !== s.horario && "border-zinc-700 hover:border-ouro",
                    )}
                  >
                    {s.horario}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {passo === 5 && (
          <div className="space-y-3">
            <div>
              <Label>Nome completo</Label>
              <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome e sobrenome" />
            </div>
            <div>
              <Label>WhatsApp</Label>
              <Input
                inputMode="numeric"
                value={telefone}
                onChange={(e) => setTelefone(maskTelefone(e.target.value))}
                placeholder="(11) 99999-9999"
              />
            </div>
            <div>
              <Label>E-mail (opcional)</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label>Observações (opcional)</Label>
              <Textarea rows={2} value={obs} onChange={(e) => setObs(e.target.value)} />
            </div>
            <div>
              <Label>Forma de pagamento</Label>
              <div className="grid grid-cols-2 gap-2">
                {(["pix", "maquininha"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPagamento(p)}
                    className={cn(
                      "rounded-md border py-2 text-sm capitalize transition",
                      pagamento === p ? "border-ouro bg-ouro/10 text-ouro" : "border-zinc-700",
                    )}
                  >
                    {p === "pix" ? "PIX" : "Maquininha"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {erro && <p className="mt-4 rounded-md bg-red-500/10 p-2 text-sm text-red-400">{erro}</p>}

        <div className="mt-6 flex items-center justify-between">
          <span className="text-sm text-zinc-400">
            Total: <span className="font-semibold text-ouro">{formatBRL(total)}</span>
          </span>
          <div className="flex gap-2">
            {passo > 0 && (
              <Button variant="outline" onClick={() => setPasso((p) => p - 1)} disabled={pending}>
                Voltar
              </Button>
            )}
            {passo < PASSOS.length - 1 ? (
              <Button onClick={() => podeAvancar() && setPasso((p) => p + 1)} disabled={!podeAvancar()}>
                Continuar
              </Button>
            ) : (
              <Button onClick={finalizar} disabled={pending}>
                {pending ? "Confirmando…" : "Confirmar agendamento"}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
