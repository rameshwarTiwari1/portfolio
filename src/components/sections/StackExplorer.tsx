"use client";

import { useId, useRef, useState } from "react";

import type { SkillGroup } from "@/lib/content";

/**
 * The stack as something you explore rather than a wall of tags.
 *
 * Implements the ARIA tabs pattern properly: arrow keys move between tabs,
 * Home/End jump to the ends, and only the active tab is in the tab order.
 */
export function StackExplorer({ groups }: { groups: SkillGroup[] }) {
  const [active, setActive] = useState(0);
  const baseId = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  if (groups.length === 0) return null;

  function focusTab(index: number) {
    const next = (index + groups.length) % groups.length;
    setActive(next);
    tabRefs.current[next]?.focus();
  }

  function onKeyDown(event: React.KeyboardEvent) {
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        focusTab(active + 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        focusTab(active - 1);
        break;
      case "Home":
        event.preventDefault();
        focusTab(0);
        break;
      case "End":
        event.preventDefault();
        focusTab(groups.length - 1);
        break;
    }
  }

  return (
    <div className="stack">
      <div
        role="tablist"
        aria-label="Technology areas"
        aria-orientation="vertical"
        className="stack-tabs"
        onKeyDown={onKeyDown}
      >
        {groups.map((group, index) => (
          <button
            key={group.slug}
            ref={(el) => {
              tabRefs.current[index] = el;
            }}
            role="tab"
            type="button"
            id={`${baseId}-tab-${index}`}
            aria-selected={index === active}
            aria-controls={`${baseId}-panel-${index}`}
            tabIndex={index === active ? 0 : -1}
            className="stack-tab"
            onClick={() => setActive(index)}
          >
            {group.name}
            <span className="ml-2 text-ink-faint">{group.items.length}</span>
          </button>
        ))}
      </div>

      {groups.map((group, index) => (
        <div
          key={group.slug}
          role="tabpanel"
          id={`${baseId}-panel-${index}`}
          aria-labelledby={`${baseId}-tab-${index}`}
          hidden={index !== active}
          tabIndex={0}
          className="stack-panel"
        >
          {group.note ? <p className="stack-note">{group.note}</p> : null}

          <ul className="stack-items">
            {group.items.map((item, i) => (
              <li
                key={item}
                className="tag"
                style={{ "--i": i } as React.CSSProperties}
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
