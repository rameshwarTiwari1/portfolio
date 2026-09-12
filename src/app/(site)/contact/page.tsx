import type { Metadata } from "next";

import { ContactForm } from "@/components/content/ContactForm";
import {
  ArrowUpRight,
  Github,
  Linkedin,
  Mail,
  MapPin,
} from "@/components/ui/Icons";
import { getSite } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch about backend architecture, multi-tenant SaaS, or AI-integrated product work.",
  alternates: { canonical: "/contact" },
};

function socialIcon(label: string) {
  const key = label.toLowerCase();
  if (key.includes("github")) return <Github />;
  if (key.includes("linkedin")) return <Linkedin />;
  return <Mail />;
}

export default async function ContactPage() {
  const site = await getSite();

  return (
    <>
      <div className="page-header">
        <div className="shell page-head-split">
          <h1 className="page-title !mt-0">Let us talk</h1>
          <div className="page-head-aside">
            <p className="page-lede">
              Whether it is a role, a system that needs rearchitecting, or a
              question about something I have written — send it over.
            </p>
          </div>
        </div>
      </div>

      <section className="section">
        <div className="shell">
          <div className="contact-grid">
            {/* Direct routes first — plenty of people will never use a form. */}
            <aside className="contact-card">
              <p className="contact-card-title">Reach me directly</p>

              <ul className="contact-list">
                <li>
                  <Mail />
                  <a href={`mailto:${site.email}`} className="link">
                    {site.email}
                  </a>
                </li>
                {site.phone ? (
                  <li>
                    <span className="contact-bullet" aria-hidden="true" />
                    <a
                      href={`tel:${site.phone.replace(/\s/g, "")}`}
                      className="link"
                    >
                      {site.phone}
                    </a>
                  </li>
                ) : null}
                {site.location ? (
                  <li>
                    <MapPin />
                    <span>{site.location}</span>
                  </li>
                ) : null}
              </ul>

              {site.socials.length > 0 ? (
                <>
                  <p className="contact-card-title">Elsewhere</p>
                  <ul className="contact-list">
                    {site.socials.map((social) => (
                      <li key={social.url}>
                        {socialIcon(social.label)}
                        <a
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="link"
                        >
                          {social.label}
                        </a>
                        <ArrowUpRight className="contact-out" />
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}

              <p className="contact-note">
                I read everything and usually reply within a day.
              </p>
            </aside>

            <div className="contact-panel">
              <h2 className="contact-panel-title">Send a message</h2>
              <ContactForm email={site.email} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
