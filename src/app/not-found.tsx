import Link from "next/link";

import { ArrowRight } from "@/components/ui/Icons";

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center">
      <div className="shell-narrow flex flex-col items-start gap-6 py-24">
        <p className="kicker">404</p>
        <h1 className="hero-title">This page does not exist.</h1>
        <p className="hero-sub">
          The link may be out of date, or the page may have moved. The work and
          writing are both still here.
        </p>
        <div className="hero-actions">
          <Link href="/" className="btn btn-primary">
            Back home
            <ArrowRight />
          </Link>
          <Link href="/work" className="btn btn-ghost">
            View work
          </Link>
        </div>
      </div>
    </div>
  );
}
