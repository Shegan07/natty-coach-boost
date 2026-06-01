import { ArrowRight } from "lucide-react";
import aboutImg from "@/assets/coach-about.jpg";

export function About() {
  return (
    <section id="about" className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-10 items-center">
        <img src={aboutImg} alt="Coach Barath in the gym" width={1024} height={1024} loading="lazy" className="w-full h-auto rounded-lg border border-border object-cover max-h-[520px]" />
        <div>
          <p className="text-xs tracking-[0.3em] text-silver-muted mb-3">ABOUT ME</p>
          <h2 className="font-display text-4xl md:text-5xl text-silver-gradient leading-tight">
            DRIVEN BY PASSION.<br/>DEDICATED TO RESULTS.
          </h2>
          <div className="mt-6 space-y-4 text-muted-foreground">
            <p>I'm Coach Barath — a certified fitness coach and natural bodybuilder. My mission is to help you transform your body and mindset through evidence-based training, personalised nutrition and real accountability.</p>
            <p>No shortcuts. No steroids. Just science, discipline and consistency.</p>
          </div>
          <a href="#programs" className="mt-8 inline-flex items-center gap-2 px-5 py-3 rounded-md border border-silver/40 font-medium hover:bg-secondary transition-colors">
            Learn More <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
