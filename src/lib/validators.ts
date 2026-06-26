import { z } from "zod";

export const agendamentoSchema = z
  .object({
    barbeiroId: z.string().min(1, "Selecione um barbeiro."),
    servicoIds: z.array(z.string()).default([]),
    comboIds: z.array(z.string()).default([]),
    data: z.string().min(1, "Selecione a data."),
    horario: z.string().min(1, "Selecione o horário."),
    cliente: z.object({
      nomeCompleto: z
        .string()
        .refine((n) => n.trim().split(/\s+/).filter(Boolean).length >= 2 && !/\d/.test(n), {
          message: "Informe nome e sobrenome, sem números.",
        }),
      telefone: z.string().refine(
        (t) => {
          const d = t.replace(/\D/g, "");
          return d.length === 10 || d.length === 11;
        },
        { message: "Telefone (WhatsApp) inválido." },
      ),
      email: z.string().email("E-mail inválido.").optional().or(z.literal("")),
      observacoes: z.string().optional(),
    }),
    formaPagamento: z.enum(["pix", "maquininha"]),
  })
  .refine((d) => d.servicoIds.length + d.comboIds.length > 0, {
    message: "Selecione ao menos um serviço ou combo.",
    path: ["servicoIds"],
  });

export const loginSchema = z.object({
  email: z.string().email("E-mail inválido."),
  senha: z.string().min(6, "Senha muito curta."),
});

export const barbeiroSchema = z.object({
  nome: z.string().min(2, "Nome obrigatório."),
  especialidade: z.string().optional(),
  descricao: z.string().optional(),
  telefone: z.string().optional(),
  instagram: z.string().optional(),
  foto: z.string().optional(),
  ativo: z.boolean().default(true),
});

export const servicoSchema = z.object({
  nome: z.string().min(2, "Nome obrigatório."),
  descricao: z.string().optional(),
  precoReais: z.coerce.number().min(0, "Preço inválido."),
  duracaoMinutos: z.coerce.number().int().min(5, "Duração inválida."),
  imagem: z.string().optional(),
  ativo: z.boolean().default(true),
});

export const configSchema = z.object({
  nomeBarbearia: z.string().min(1),
  whatsapp: z.string().optional(),
  instagram: z.string().optional(),
  endereco: z.string().optional(),
  horarioFuncionamento: z.string().optional(),
  chavePix: z.string().optional(),
  logo: z.string().optional(),
  tema: z.string().optional(),
});
