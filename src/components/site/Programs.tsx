import { ArrowRight, Flame, Dumbbell, Laptop } from "lucide-react";

const programs = [
  {
    icon: Flame,
    title: "Weight Loss Coaching",
    desc: "Sustainable fat-loss plans with structured training and flexible nutrition that fits your lifestyle.",
  },
  {
    icon: Dumbbell,
    title: "Muscle Gain Coaching",
    desc: "Progressive overload programs and high-protein meal plans engineered for natural lean muscle growth.",
  },
  {
    icon: Laptop,
    title: "Online Personal Coaching",
    desc: "Weekly check-ins, custom programming and direct WhatsApp support — wherever you are in the world.",
  },
];

export function Programs() {
  return (
    <section id="programs" className="py-20 md:py-28 bg-card/30 border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-xs tracking-[0.3em] text-silver-muted mb-3">COACHING PROGRAMS</p>
          <h2 className="font-display text-4xl md:text-5xl text-silver-gradient">CUSTOMIZED FOR YOU</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {programs.map((p) => (
            <div key={p.title} className="group p-8 rounded-lg bg-background border border-border hover:border-silver/40 transition-colors">
              <div className="h-12 w-12 rounded-md bg-secondary border border-border flex items-center justify-center mb-6">
                <p.icon className="h-5 w-5 text-silver" />
              </div>
              <h3 className="font-display text-xl mb-3">{p.title}</h3>
              <p className="text-sm text-muted-foreground mb-6">{p.desc}</p>
              <a href="#contact" className="inline-flex items-center gap-2 text-sm font-medium text-silver hover:text-foreground transition-colors">
                Enroll Now <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
