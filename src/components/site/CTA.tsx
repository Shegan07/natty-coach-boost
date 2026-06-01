import { Calendar, MessageCircle } from "lucide-react";

export function CTA() {
  return (
    <section id="contact" className="py-20 md:py-28">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-silver/30 bg-card p-8 md:p-14 text-center">
          <h2 className="font-display text-4xl md:text-5xl text-silver-gradient">READY TO TRANSFORM YOUR BODY?</h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">Book your free consultation call and let's build the best version of you — together.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href="#book" className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-primary text-primary-foreground font-medium hover:bg-silver transition-colors">
              <Calendar className="h-4 w-4" /> Book Free Consultation
            </a>
            <a href="https://wa.me/911234567890" className="inline-flex items-center gap-2 px-6 py-3 rounded-md border border-silver/40 font-medium hover:bg-secondary transition-colors">
              <MessageCircle className="h-4 w-4" /> WhatsApp Me
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
