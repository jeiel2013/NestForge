const stats = [
  ['3', 'ORM integrations'],
  ['4', 'authentication modes'],
  ['4', 'database choices'],
  ['23', 'generator scenarios'],
];

export function QualitySection() {
  return (
    <section className="border-b border-white/10 bg-black/25">
      <div className="mx-auto grid max-w-7xl grid-cols-2 lg:grid-cols-4">
        {stats.map(([value, label]) => (
          <div
            key={label}
            className="border-b border-white/10 px-5 py-10 text-center even:border-l sm:px-8 lg:border-b-0 lg:border-l lg:first:border-l-0"
          >
            <p className="font-display text-4xl font-light tracking-[-0.04em] text-white sm:text-5xl">
              {value}
            </p>
            <p className="mt-2 text-sm text-white/40">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
