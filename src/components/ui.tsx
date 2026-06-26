import * as React from "react";

export function cn(...c: (string | false | null | undefined)[]): string {
  return c.filter(Boolean).join(" ");
}

type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "outline" | "danger";
};
export function Button({ className, variant = "primary", ...props }: BtnProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition disabled:opacity-50 disabled:pointer-events-none";
  const variants: Record<string, string> = {
    primary: "bg-ouro text-carvao hover:bg-ouro-400",
    ghost: "text-zinc-200 hover:bg-zinc-800",
    outline: "border border-zinc-700 text-zinc-100 hover:border-ouro hover:text-ouro",
    danger: "bg-red-600 text-white hover:bg-red-500",
  };
  return <button className={cn(base, variants[variant], className)} {...props} />;
}

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-md border border-zinc-700 bg-grafite px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-ouro",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-md border border-zinc-700 bg-grafite px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-ouro",
        className,
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-400", className)} {...props} />;
}

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-xl border border-zinc-800 bg-grafite/60 p-5", className)} {...props} />;
}

export function Badge({ className, children }: { className?: string; children: React.ReactNode }) {
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", className)}>{children}</span>;
}

export const statusBadge: Record<string, string> = {
  pendente: "bg-amber-500/15 text-amber-400",
  confirmado: "bg-blue-500/15 text-blue-400",
  concluido: "bg-emerald-500/15 text-emerald-400",
  cancelado: "bg-red-500/15 text-red-400",
};
