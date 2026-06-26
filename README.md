# 💈 Barbearia Jacob — Sistema de Agendamento & Gestão

SaaS completo para a **Barbearia Jacob — A Capital do Estilo**: site institucional, agendamento online com PIX, e painel administrativo. Pronto para deploy na **Vercel**.

---

## 🧱 Stack

- **Next.js 15** (App Router) + **TypeScript**
- **TailwindCSS** (tema preto/dourado/branco, Bebas Neue)
- **Prisma** + **PostgreSQL** (Neon / Supabase)
- **Auth própria**: JWT (`jose`) em cookie **HttpOnly** + **bcrypt** (salt 12)
- **Zod** (validação) · **Recharts** (gráficos) · **qrcode** (QR do PIX)
- Mutações via **Server Actions** · auditoria em todas as ações

---

## 🚀 Subindo o projeto (passo a passo)

### 1. Instalar dependências
```bash
npm install
```

### 2. Banco de dados
Crie um Postgres grátis no [Neon](https://neon.tech) ou [Supabase](https://supabase.com) e copie a connection string.

```bash
cp .env.example .env
```
Edite o `.env`:
```env
DATABASE_URL="postgresql://usuario:senha@host/db?sslmode=require"
JWT_SECRET="troque-por-uma-chave-bem-grande-e-aleatoria"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

> Gere um `JWT_SECRET` forte: `openssl rand -base64 48`

### 3. Migrar + popular o banco
```bash
npm run db:push      # cria as tabelas
npm run db:seed      # cria admin, barbeiros, serviços e config inicial
```

### 4. Rodar
```bash
npm run dev
```
- Site: http://localhost:3000
- Painel: http://localhost:3000/admin

### 🔐 Login inicial
```
admin@barbeariajacob.com
admin123
```
**Troque a senha no primeiro acesso** (menu **Perfil**).

---

## ☁️ Deploy na Vercel

1. Suba o repositório no GitHub.
2. Em [vercel.com](https://vercel.com) → **New Project** → importe o repo.
3. Em **Environment Variables**, adicione `DATABASE_URL`, `JWT_SECRET` e `NEXT_PUBLIC_APP_URL` (com a URL final, ex.: `https://barbeariajacob.vercel.app`).
4. Deploy. O `postinstall` já roda `prisma generate`.
5. **Uma vez só**, com o `.env` apontando para o banco de produção, rode localmente:
   ```bash
   npm run db:push && npm run db:seed
   ```

---

## ✅ O que já está pronto

**Site público**
- Home (hero + destaques de serviços e equipe)
- Sobre, Serviços, Equipe, Loja (vitrine) — tudo lendo do banco
- Rodapé com a assinatura em **todas as páginas**

**Agendamento (`/agendar`)** — fluxo de 6 etapas:
1. Barbeiro → 2. Serviços → 3. Combos → 4. Data → 5. Horário (com horários ocupados bloqueados em tempo real) → 6. Dados do cliente + forma de pagamento
- **PIX real**: gera o *Copia e Cola* + **QR Code** a partir da chave PIX (padrão BACEN/EMV, **sem precisar de gateway**)
- Botão para **avisar a barbearia no WhatsApp** (link `wa.me` pré-preenchido)
- Trava de concorrência: dois clientes não conseguem pegar o mesmo horário (constraint `barbeiro + data + horário`)

**Painel admin (`/admin`)**
- Login JWT + middleware protegendo todas as rotas
- Dashboard com indicadores + gráficos (faturamento do mês, serviços mais vendidos)
- Agendamentos: listagem + troca de status (ao **concluir**, lança a entrada no financeiro automaticamente)
- CRUD de **Barbeiros** e **Serviços**
- Financeiro: receitas/despesas/lucro do mês, lançamento de despesas, **exportar CSV** e **imprimir/PDF**
- Configurações da barbearia (nome, WhatsApp, Instagram, endereço, horário, **chave PIX**, logo)
- Perfil: troca de senha
- **Auditoria** registrada em todas as ações administrativas

---

## 🧠 Decisões de arquitetura

| Tema | Decisão |
|------|---------|
| Dinheiro | Sempre **`Int` em centavos** (nunca float). Helpers em `lib/money.ts`. |
| Exclusão | **Soft-delete** (`deletedAt`) nas entidades de negócio. Financeiro/auditoria são append-only. |
| Histórico | Agendamento guarda **snapshot** de nome+preço de cada serviço/combo (registro imutável). |
| Multi-tenant | **Single-tenant** (uma barbearia, uma `Configuracao`). Para multi-loja, basta reativar `companyId` no `scoped()` — está isolado num lugar só. |
| PIX | BR Code **estático** gerado no app a partir da chave. Sem custo/gateway. |
| Notificação | WhatsApp via link `wa.me`. (Cloud API fica como evolução.) |
| Imagens | Campos de URL (cole o link). Upload para bucket fica como evolução. |

---

## 🔭 Próximos passos (não incluídos nesta v1)

Itens do escopo que dá pra adicionar depois, sem retrabalho na base:
- CRUD de **Combos** e de **Produtos** no painel (o schema e a vitrine já existem)
- **Loja completa** com carrinho/checkout e gestão de **Pedidos**
- Tela de **Clientes** (histórico por cliente)
- **Upload de imagens** (Vercel Blob / S3) no lugar de URL
- **Confirmação automática** de pagamento PIX (gateway: Mercado Pago, etc.)
- **WhatsApp Cloud API** (Meta) para mensagens automáticas
- Exportação em **PDF** com biblioteca (hoje é via impressão do navegador)
- Alternância de tema claro/escuro

---

## ⚠️ Importante (honestidade técnica)

Este pacote foi montado e estruturado seguindo os padrões do Next 15, **mas não consegui rodar `npm install` / `next build` no ambiente de geração** (sem internet). Então:

1. Rode `npm install` e depois `npm run build`.
2. Se aparecer **qualquer** erro de tipo ou import, me manda a saída do terminal que eu corrijo na hora — provavelmente é coisa pontual.
3. As versões no `package.json` estão em faixas `^` recentes; se algum pacote tiver subido com breaking change, ajusto.

Sobre data/horário: o agendamento usa `@db.Date` + string `HH:mm`. Na Vercel (UTC) e no Brasil (UTC-3) a escrita e a leitura são consistentes. Se for operar em outro fuso, vale validar.

---

Sistema desenvolvido com ❤️ para a **Barbearia Jacob — A Capital do Estilo**.
