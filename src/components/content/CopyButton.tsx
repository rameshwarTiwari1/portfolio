"use client";

import { useEffect, useState } from "react";

import { Check, Copy } from "@/components/ui/Icons";

export function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(timer);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      // Clipboard blocked (insecure context or denied permission) — the code
      // is still selectable, so fail quietly rather than showing an error.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="icon-btn icon-btn-sm"
      aria-label={copied ? "Copied" : "Copy code"}
      title={copied ? "Copied" : "Copy code"}
    >
      {copied ? <Check /> : <Copy />}
    </button>
  );
}
