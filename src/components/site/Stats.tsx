const stats = [
  { value: "100+", label: "Clients Coached" },
  { value: "200+", label: "Transformations" },
  { value: "5+", label: "Years Experience" },
  { value: "4.9", label: "Average Rating" },
];

export function Stats() {
  return (
    <section className="border-y border-border bg-card/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((s) => (
          <div key={s.label} className="text-center md:text-left">
            <div className="font-display text-3xl md:text-4xl text-silver-gradient">{s.value}</div>
            <div className="mt-1 text-xs tracking-widest uppercase text-silver-muted">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
