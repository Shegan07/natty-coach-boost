import { Star, Quote } from "lucide-react";

const reviews = [
  { name: "Saran", city: "Chennai", text: "Coach Barath changed my life completely. Lost 12kg and gained so much confidence. His plans are simple, effective and sustainable." },
  { name: "Karthik", city: "Bangalore", text: "Best decision I made. His workout and diet plans are so well structured and easy to follow. 100% natural, 100% results." },
  { name: "Naveen", city: "Coimbatore", text: "Amazing coach and an even better human being. He actually cares about your progress and pushes you to become your best." },
];

export function Testimonials() {
  return (
    <section className="py-20 md:py-28 bg-card/30 border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-xs tracking-[0.3em] text-silver-muted mb-3">TESTIMONIALS</p>
          <h2 className="font-display text-4xl md:text-5xl text-silver-gradient">WHAT CLIENTS SAY</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {reviews.map((r) => (
            <div key={r.name} className="p-7 rounded-lg bg-background border border-border">
              <Quote className="h-6 w-6 text-silver-muted mb-4" />
              <p className="text-sm text-muted-foreground leading-relaxed">{r.text}</p>
              <div className="flex gap-0.5 mt-5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-silver text-silver" />
                ))}
              </div>
              <div className="mt-5 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-secondary border border-border flex items-center justify-center font-display text-silver">
                  {r.name[0]}
                </div>
                <div>
                  <div className="text-sm font-medium">{r.name}</div>
                  <div className="text-xs text-silver-muted">{r.city}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
