import Link from "next/link";

import { ArrowRight, ArrowUpRight, Rss } from "@/components/ui/Icons";
import type { SiteSettings } from "@/lib/content";
import { NAV_LINKS } from "@/lib/site";

export function Footer({ site }: { site: SiteSettings }) {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="shell">
        <div className="footer-grid">
          <div className="footer-brand">
            <p className="footer-name">{site.name}</p>
            <p className="footer-role">{site.role}</p>
            {site.location ? (
              <p className="meta mt-3">{site.location}</p>
            ) : null}

            {/* freelance CTA — parked with /hire. To restore:
            <Link href="/hire" className="btn btn-primary mt-5">
              Hire me
              <ArrowRight />
            </Link>
            */}
            <Link href="/contact" className="btn btn-ghost mt-5">
              Get in touch
              <ArrowRight />
            </Link>
          </div>

          <nav aria-label="Footer" className="footer-col">
            <p className="footer-heading">Navigate</p>
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="footer-link">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="footer-col">
            <p className="footer-heading">Elsewhere</p>
            {site.socials.map((social) => (
              <a
                key={social.url}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link"
              >
                {social.label}
                <ArrowUpRight className="footer-link-icon" />
              </a>
            ))}
            <Link href="/engineering/rss.xml" className="footer-link">
              RSS
              <Rss className="footer-link-icon" />
            </Link>
          </div>

          <div className="footer-col">
            <p className="footer-heading">Contact</p>
            <a href={`mailto:${site.email}`} className="footer-link">
              {site.email}
            </a>
            {site.phone ? (
              <a
                href={`tel:${site.phone.replace(/\s/g, "")}`}
                className="footer-link"
              >
                {site.phone}
              </a>
            ) : null}
            {site.resumeUrl ? (
              <a
                href={site.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link"
              >
                Resume (PDF)
                <ArrowUpRight className="footer-link-icon" />
              </a>
            ) : null}
          </div>
        </div>

        <div className="footer-base">
          <p className="meta">
            © {year} {site.name}
          </p>
        </div>
      </div>
    </footer>
  );
}
