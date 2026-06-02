import { ArrowRight, MessageCircle } from "lucide-react";
import heroImg from "@/assets/coach-hero.jpg";
import { WHATSAPP_LINK } from "@/lib/site.config";

export function Hero() {
  return (
    <section id="home" className="relative pt-24 md:pt-28 pb-16 md:pb-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
        <div className="order-2 lg:order-1">
          <p className="text-xs sm:text-sm tracking-[0.3em] text-silver-muted mb-4">DISCIPLINE • CONSISTENCY • RESULTS</p>
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-[0.95] text-silver-gradient">
            NATTY COACH<br/>BARATH
          </h1>
          <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-xl">
            Natural Fitness Coach helping you build muscle, lose fat and become your strongest self — through evidence-based training and nutrition.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#programs" className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-primary text-primary-foreground font-medium hover:bg-silver transition-colors">
              Get Started <ArrowRight className="h-4 w-4" />
            </a>
            <a href={WHATSAPP_LINK} className="inline-flex items-center gap-2 px-6 py-3 rounded-md border border-silver/40 font-medium hover:bg-secondary transition-colors">
              <MessageCircle className="h-4 w-4" /> WhatsApp Me
            </a>
          </div>
        </div>

        <div className="order-1 lg:order-2 relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-background via-transparent to-transparent z-10 pointer-events-none" />
          <img
            src={heroImg}
            alt="Coach Barath, natural fitness coach"
            width={1024}
            height={1280}
            className="w-full h-auto object-cover rounded-lg border border-border max-h-[640px]"
          />
        </div>
      </div>
    </section>
  );
}
