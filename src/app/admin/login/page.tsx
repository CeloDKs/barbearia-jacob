"use client";

import { useActionState } from "react";
import { login } from "@/lib/actions";
import { Button, Input, Label, Card } from "@/components/ui";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, { erro: "" });
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <h1 className="text-center font-display text-3xl text-ouro">BARBEARIA JACOB</h1>
        <p className="mb-6 mt-1 text-center text-sm text-zinc-400">Painel administrativo</p>
        <form action={formAction} className="space-y-3">
          <div>
            <Label>E-mail</Label>
            <Input name="email" type="email" required defaultValue="admin@barbeariajacob.com" />
          </div>
          <div>
            <Label>Senha</Label>
            <Input name="senha" type="password" required placeholder="••••••••" />
          </div>
          {state?.erro && <p className="text-sm text-red-400">{state.erro}</p>}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Entrando…" : "Entrar"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
