import { Instagram, Youtube, MessageCircle, Mail, Phone, MapPin } from "lucide-react";
import { WHATSAPP_LINK, PHONE_DISPLAY, EMAIL } from "@/lib/site.config";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-md border border-silver/40 flex items-center justify-center font-display text-silver">B</div>
            <div className="leading-tight">
              <div className="font-display text-sm tracking-wider">NATTY COACH</div>
              <div className="font-display text-sm tracking-wider text-silver-muted">BARATH</div>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">Building natural athletes. Changing lives.</p>
        </div>

        <div>
          <h3 className="font-display text-sm tracking-widest mb-4">QUICK LINKS</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="#home" className="hover:text-foreground">Home</a></li>
            <li><a href="#about" className="hover:text-foreground">About</a></li>
            <li><a href="#programs" className="hover:text-foreground">Programs</a></li>
            <li><a href="#results" className="hover:text-foreground">Results</a></li>
            <li><a href="#contact" className="hover:text-foreground">Contact</a></li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm tracking-widest mb-4">CONTACT</h3>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-silver" /> {PHONE_DISPLAY}</li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-silver" /> {EMAIL}</li>
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-silver" /> Chennai, Tamil Nadu</li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm tracking-widest mb-4">FOLLOW ME</h3>
          <div className="flex gap-3">
            <a href="#" aria-label="Instagram" className="h-10 w-10 rounded-md border border-border hover:border-silver/40 hover:bg-secondary flex items-center justify-center transition-colors">
              <Instagram className="h-4 w-4 text-silver" />
            </a>
            <a href="#" aria-label="YouTube" className="h-10 w-10 rounded-md border border-border hover:border-silver/40 hover:bg-secondary flex items-center justify-center transition-colors">
              <Youtube className="h-4 w-4 text-silver" />
            </a>
            <a href={WHATSAPP_LINK} aria-label="WhatsApp" className="h-10 w-10 rounded-md border border-border hover:border-silver/40 hover:bg-secondary flex items-center justify-center transition-colors">
              <MessageCircle className="h-4 w-4 text-silver" />
            </a>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">Let's connect and grow together.</p>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-silver-muted">
          <div>© {new Date().getFullYear()} Natty Coach Barath. All rights reserved.</div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-foreground">Privacy Policy</a>
            <a href="#" className="hover:text-foreground">Terms & Conditions</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
