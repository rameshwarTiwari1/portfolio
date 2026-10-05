/**
 * Reference architecture — the shape these systems take, not a screenshot of
 * one product.
 *
 * That distinction is the whole point. Drawing RLS, queues and retrieval on a
 * single request path of a *named* system would be a lie: the CRM has no
 * vector search, Vashix has no carrier integrations. Drawn as the pattern they
 * are all instances of, every box is true.
 *
 * Pure SVG and CSS: no library, no client JS, sharp at any size, and it
 * recolours with the theme because every value is a token.
 */

interface Node {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  sub: string;
  tone?: "accent" | "muted";
}

const TIERS: { label: string; x: number }[] = [
  { label: "clients", x: 16 },
  { label: "edge", x: 196 },
  { label: "application", x: 386 },
  { label: "background", x: 576 },
  { label: "data — tenant-scoped", x: 812 },
];

const NODES: Node[] = [
  { id: "web", x: 16, y: 170, w: 140, h: 58, title: "Web app", sub: "Next.js" },
  { id: "sdk", x: 16, y: 250, w: 140, h: 58, title: "Mobile SDK", sub: "signed capture" },

  { id: "edge", x: 196, y: 186, w: 150, h: 86, title: "Edge", sub: "Nginx · TLS" },

  { id: "api", x: 386, y: 108, w: 150, h: 64, title: "API", sub: "handler · RBAC" },
  { id: "queue", x: 386, y: 228, w: 150, h: 64, title: "Queue", sub: "BullMQ · Redis" },

  { id: "worker", x: 576, y: 228, w: 150, h: 64, title: "Workers", sub: "idempotent · retried" },
  {
    id: "external",
    x: 576,
    y: 336,
    w: 150,
    h: 64,
    title: "External APIs",
    sub: "carriers · LLMs",
    tone: "muted",
  },

  { id: "pg", x: 812, y: 108, w: 176, h: 64, title: "Postgres", sub: "RLS on tenant_id", tone: "accent" },
  { id: "vec", x: 812, y: 200, w: 176, h: 64, title: "pgvector", sub: "scoped retrieval", tone: "accent" },
  { id: "blob", x: 812, y: 292, w: 176, h: 64, title: "S3", sub: "per-tenant prefix", tone: "accent" },
];

interface Wire {
  d: string;
  len: number;
  kind?: "scoped" | "async" | "plain";
  packet?: boolean;
}

/** Lengths only need to exceed the true path length for the draw-in. */
const WIRES: Wire[] = [
  { d: "M 156 199 C 176 199, 176 212, 196 212", len: 60, packet: true },
  { d: "M 156 279 C 176 279, 176 246, 196 246", len: 60 },
  { d: "M 346 229 C 366 229, 366 140, 386 140", len: 130, packet: true },

  // Fast path straight to the database, crossing the boundary.
  { d: "M 536 140 L 812 140", len: 290, kind: "scoped", packet: true },

  // Slow work is handed to a queue instead of blocking the response.
  { d: "M 461 172 L 461 228", len: 70, kind: "async" },
  { d: "M 536 260 L 576 260", len: 50, kind: "async" },
  { d: "M 651 292 L 651 336", len: 55, kind: "async" },

  // Workers reach the same boundary as the request path — no side door.
  { d: "M 726 248 C 774 248, 782 152, 812 152", len: 170, kind: "scoped" },
  { d: "M 726 262 C 772 262, 776 232, 812 232", len: 130, kind: "scoped", packet: true },
  { d: "M 726 276 C 772 276, 776 324, 812 324", len: 140, kind: "scoped" },
];

const BOUNDARY_X = 776;

export function ArchitectureDiagram() {
  return (
    <figure className="arch">
      <figcaption className="arch-bar">
        <span className="arch-dot" aria-hidden="true" />
        <span className="arch-dot" aria-hidden="true" />
        <span className="arch-dot" aria-hidden="true" />
        <span className="arch-label">reference architecture — multi-tenant</span>
      </figcaption>

      <div className="arch-canvas">
        <svg
          viewBox="0 0 1004 430"
          role="img"
          aria-label="Reference architecture. Web and mobile clients reach an Nginx edge that terminates TLS and resolves the tenant. The API handles authorisation and either serves a request synchronously or hands slow work to a BullMQ and Redis queue. Workers process that queue, calling external carrier and LLM APIs. Every path into the data tier — Postgres with row-level security, pgvector retrieval, and per-tenant S3 storage — crosses the same enforced tenant boundary; nothing reaches storage around it."
        >
          {/* The boundary is the point of the whole diagram, so it is drawn
              first and sits behind everything as a piece of structure. */}
          <g className="arch-boundary">
            <line x1={BOUNDARY_X} y1={62} x2={BOUNDARY_X} y2={402} />
            <text x={BOUNDARY_X} y={52} textAnchor="middle">
              tenant boundary — enforced, not conventional
            </text>
          </g>

          {TIERS.map((tier) => (
            <text key={tier.label} className="arch-tier" x={tier.x} y={88}>
              {tier.label}
            </text>
          ))}

          {WIRES.map((wire, i) => (
            <path
              key={wire.d}
              d={wire.d}
              className={[
                "arch-wire",
                wire.kind === "scoped" ? "arch-wire-scoped" : "",
                wire.kind === "async" ? "arch-wire-async" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              style={{ "--len": wire.len, "--i": i } as React.CSSProperties}
            />
          ))}

          {WIRES.filter((w) => w.packet).map((wire, i) => (
            <circle
              key={`packet-${wire.d}`}
              r={3.5}
              className="arch-packet"
              style={
                { "--path": `path("${wire.d}")`, "--i": i } as React.CSSProperties
              }
              aria-hidden="true"
            />
          ))}

          {NODES.map((node, i) => (
            <g
              key={node.id}
              className="arch-node-group"
              style={{ "--i": i } as React.CSSProperties}
            >
              <rect
                x={node.x}
                y={node.y}
                width={node.w}
                height={node.h}
                rx={7}
                className={[
                  "arch-node",
                  node.tone === "accent" ? "arch-node-accent" : "",
                  node.tone === "muted" ? "arch-node-muted" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              />
              <text
                x={node.x + node.w / 2}
                y={node.y + 27}
                textAnchor="middle"
                className={`arch-text${node.tone === "accent" ? " arch-text-accent" : ""}`}
              >
                {node.title}
              </text>
              <text
                x={node.x + node.w / 2}
                y={node.y + 44}
                textAnchor="middle"
                className="arch-text-sm"
              >
                {node.sub}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="arch-legend">
        <span className="arch-legend-item">
          <span className="arch-legend-swatch arch-legend-scoped" />
          tenant-scoped
        </span>
        <span className="arch-legend-item">
          <span className="arch-legend-swatch arch-legend-async" />
          asynchronous
        </span>
        <span className="arch-legend-item">
          <span className="arch-legend-swatch arch-legend-plain" />
          unscoped
        </span>
        <span className="arch-legend-item arch-legend-note">
          The pattern, not one product — each case study is a close-up of part
          of it.
        </span>
      </div>
    </figure>
  );
}
