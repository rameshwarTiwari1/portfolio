import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { CursorGlow } from "@/components/ui/CursorGlow";
import { getSite } from "@/lib/content";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const site = await getSite();

  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Header name={site.name} resumeUrl={site.resumeUrl} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer site={site} />
      <CursorGlow />
    </div>
  );
}
