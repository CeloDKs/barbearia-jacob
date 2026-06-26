"use client";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

const ouro = "#C9A24B";

export function FaturamentoChart({ data }: { data: { dia: string; valor: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
        <XAxis dataKey="dia" stroke="#71717a" fontSize={12} />
        <YAxis stroke="#71717a" fontSize={12} tickFormatter={(v) => `R$${v}`} />
        <Tooltip
          formatter={(v: number) => [`R$ ${v.toFixed(2)}`, "Faturamento"]}
          contentStyle={{ background: "#161618", border: "1px solid #27272a", borderRadius: 8, color: "#fff" }}
        />
        <Bar dataKey="valor" fill={ouro} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TopServicosChart({ data }: { data: { nome: string; qtd: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
        <XAxis type="number" stroke="#71717a" fontSize={12} allowDecimals={false} />
        <YAxis type="category" dataKey="nome" stroke="#71717a" fontSize={12} width={120} />
        <Tooltip
          formatter={(v: number) => [v, "Qtd"]}
          contentStyle={{ background: "#161618", border: "1px solid #27272a", borderRadius: 8, color: "#fff" }}
        />
        <Bar dataKey="qtd" fill={ouro} radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
