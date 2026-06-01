import t1 from "@/assets/transform-1.jpg";
import t2 from "@/assets/transform-2.jpg";
import t3 from "@/assets/transform-3.jpg";
import t4 from "@/assets/transform-4.jpg";

const items = [
  { img: t1, name: "Arun", caption: "5 Months Transformation" },
  { img: t2, name: "Vignesh", caption: "6 Months Transformation" },
  { img: t3, name: "Karthik", caption: "4 Months Transformation" },
  { img: t4, name: "Praveen", caption: "7 Months Transformation" },
];

export function Results() {
  return (
    <section id="results" className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-xs tracking-[0.3em] text-silver-muted mb-3">TRANSFORMATIONS</p>
          <h2 className="font-display text-4xl md:text-5xl text-silver-gradient">REAL PEOPLE. REAL RESULTS.</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {items.map((it) => (
            <figure key={it.name} className="group relative overflow-hidden rounded-lg border border-border">
              <img src={it.img} alt={`${it.name} transformation`} loading="lazy" width={800} height={512} className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105" />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background via-background/80 to-transparent p-4">
                <div className="font-display tracking-wider">{it.name.toUpperCase()}</div>
                <div className="text-xs text-silver-muted uppercase tracking-widest">{it.caption}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
