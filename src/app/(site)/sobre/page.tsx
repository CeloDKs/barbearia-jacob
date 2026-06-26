export default function Sobre() {
  const diferenciais = [
    ["Atendimento premium", "Cada cliente recebe atenção dedicada do início ao fim."],
    ["Profissionais especialistas", "Equipe treinada nas técnicas mais atuais de corte e barba."],
    ["Ambiente exclusivo", "Um espaço pensado para o seu conforto e estilo."],
  ];
  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="font-display text-5xl text-ouro">Sobre a Barbearia Jacob</h1>
      <p className="mt-6 text-zinc-300">
        A Barbearia Jacob nasceu com um propósito: elevar o cuidado masculino a outro patamar. Mais do que
        um corte, entregamos uma experiência — precisão, técnica e respeito pelo seu tempo. Somos a Capital do Estilo.
      </p>
      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {diferenciais.map(([t, d]) => (
          <div key={t} className="rounded-xl border border-zinc-800 bg-grafite/60 p-6">
            <div className="font-display text-2xl text-zinc-50">{t}</div>
            <p className="mt-2 text-sm text-zinc-400">{d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
