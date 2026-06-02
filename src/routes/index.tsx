import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { Stats } from "@/components/site/Stats";
import { About } from "@/components/site/About";
import { Programs } from "@/components/site/Programs";
import { Results } from "@/components/site/Results";
import { Testimonials } from "@/components/site/Testimonials";
import { CTA } from "@/components/site/CTA";
import { Footer } from "@/components/site/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Natty Coach Barath — Natural Fitness Coaching" },
      { name: "description", content: "Personalized training and nutrition coaching to help you build muscle, lose fat and become your strongest self — naturally." },
      { property: "og:title", content: "Natty Coach Barath — Natural Fitness Coaching" },
      { property: "og:description", content: "Build muscle. Lose fat. Transform naturally with Coach Barath." },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Oswald:wght@500;600;700&display=swap" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <About />
        <Programs />
        <Results />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
