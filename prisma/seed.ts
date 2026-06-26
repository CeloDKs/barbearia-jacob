import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Configuração (singleton)
  if (!(await prisma.configuracao.findFirst())) {
    await prisma.configuracao.create({
      data: {
        nomeBarbearia: "Barbearia Jacob",
        whatsapp: "5511999999999",
        instagram: "@barbeariajacob",
        endereco: "Rua Exemplo, 123 - Caieiras/SP",
        horarioFuncionamento: "Seg a Sáb, 09h às 20h",
        chavePix: "barbeariajacob@pix.com",
        tema: "dark",
      },
    });
  }

  // Admin inicial
  const email = "admin@barbeariajacob.com";
  if (!(await prisma.admin.findUnique({ where: { email } }))) {
    await prisma.admin.create({
      data: { nome: "Jacob", email, senhaHash: await bcrypt.hash("admin123", 12) },
    });
    console.log(`Admin: ${email} / admin123  (troque após o 1º login)`);
  }

  // Barbeiros
  for (const b of [
    { nome: "Jacob", especialidade: "Degradê & Navalha" },
    { nome: "Léo", especialidade: "Barba & Pigmentação" },
  ]) {
    if (!(await prisma.barbeiro.findFirst({ where: { nome: b.nome, deletedAt: null } }))) {
      await prisma.barbeiro.create({ data: b });
    }
  }

  // Serviços (preços em CENTAVOS)
  for (const s of [
    { nome: "Corte Masculino", preco: 4000, duracaoMinutos: 40 },
    { nome: "Barba", preco: 3000, duracaoMinutos: 30 },
    { nome: "Corte + Barba", preco: 6500, duracaoMinutos: 70 },
  ]) {
    if (!(await prisma.servico.findFirst({ where: { nome: s.nome, deletedAt: null } }))) {
      await prisma.servico.create({ data: s });
    }
  }

  // Produto da loja
  if (!(await prisma.produto.findFirst({ where: { nome: "Pomada Modeladora", deletedAt: null } }))) {
    await prisma.produto.create({
      data: { nome: "Pomada Modeladora", preco: 3500, estoque: 20, categoria: "Finalizadores", imagens: [] },
    });
  }

  console.log("Seed concluído.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
