import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export interface LegalSection {
  heading: string;
  body: string[];
}

export function LegalPage({ title, updated, sections }: { title: string; updated: string; sections: LegalSection[] }) {
  return (
    <div className="relative min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 pb-20 pt-28 sm:px-6">
        <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: {updated}</p>

        <div className="mt-10 space-y-8">
          {sections.map((s, i) => (
            <section key={i} id={s.heading.toLowerCase().replace(/[^a-z0-9]+/g, "-")}>
              <h2 className="text-xl font-bold">{s.heading}</h2>
              {s.body.map((p, j) => (
                <p key={j} className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {p}
                </p>
              ))}
            </section>
          ))}
        </div>

        <p className="mt-12 rounded-2xl bg-white/5 p-4 text-xs text-muted-foreground">
          This is a general template and not legal advice. Please review and adapt it with a
          qualified professional before relying on it for your business.
        </p>
      </main>
      <Footer />
    </div>
  );
}
