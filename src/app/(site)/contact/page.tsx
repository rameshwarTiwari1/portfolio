import type { Metadata } from "next";

import { ContactForm } from "@/components/content/ContactForm";
import { Github, Linkedin, Mail, MapPin } from "@/components/ui/Icons";
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
        <div className="shell">
          <h1 className="page-title">Let us talk</h1>
          <p className="page-lede">
            Whether it is a role, a system that needs rearchitecting, or a
            question about something I have written — send it over.
          </p>
        </div>
      </div>

      <section className="section">
        <div className="shell">
          <div className="contact-grid">
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-4">
                <a
                  href={`mailto:${site.email}`}
                  className="link-arrow text-ink"
                >
                  <Mail />
                  {site.email}
                </a>
                {site.phone ? (
                  <a
                    href={`tel:${site.phone.replace(/\s/g, "")}`}
                    className="link-arrow text-ink"
                  >
                    {site.phone}
                  </a>
                ) : null}
                {site.location ? (
                  <p className="link-arrow">
                    <MapPin />
                    {site.location}
                  </p>
                ) : null}
              </div>

              {site.socials.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {site.socials.map((social) => (
                    <a
                      key={social.url}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-arrow text-ink"
                    >
                      {socialIcon(social.label)}
                      {social.label}
                    </a>
                  ))}
                </div>
              ) : null}

              <div className="callout">
                <p>I read everything and usually reply within a day.</p>
              </div>
            </div>

            <ContactForm email={site.email} />
          </div>
        </div>
      </section>
    </>
  );
}
