/**
 * The hero's signature moment: a real multi-tenant request path, drawn once
 * on load, with requests travelling the happy path afterwards.
 *
 * This is the artifact, not decoration — it is the architecture described in
 * the CRM case study, rendered as the thing itself. Pure CSS/SVG, no library,
 * no client JS: it ships as static markup and animates on the compositor.
 */

interface Node {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  sub: string;
  accent?: boolean;
}

const NODES: Node[] = [
  { id: "client", x: 2, y: 72, w: 84, h: 46, title: "Client", sub: "tenant-a" },
  { id: "edge", x: 116, y: 72, w: 92, h: 46, title: "Edge", sub: "resolve ctx" },
  { id: "api", x: 238, y: 10, w: 88, h: 46, title: "API", sub: "handler" },
  { id: "queue", x: 238, y: 134, w: 88, h: 46, title: "Queue", sub: "BullMQ" },
  {
    id: "rls",
    x: 356,
    y: 72,
    w: 104,
    h: 46,
    title: "RLS",
    sub: "tenant_id",
    accent: true,
  },
  { id: "db", x: 490, y: 72, w: 88, h: 46, title: "Postgres", sub: "shared" },
];

interface Wire {
  d: string;
  len: number;
  accent?: boolean;
  packet?: boolean;
}

/** Lengths are approximate — they only need to exceed the true path length. */
const WIRES: Wire[] = [
  { d: "M 86 95 L 116 95", len: 40, packet: true },
  { d: "M 208 95 C 223 95, 223 33, 238 33", len: 90, packet: true },
  { d: "M 208 95 C 223 95, 223 157, 238 157", len: 90 },
  { d: "M 326 33 C 341 33, 341 95, 356 95", len: 90, accent: true, packet: true },
  { d: "M 326 157 C 341 157, 341 95, 356 95", len: 90, accent: true },
  { d: "M 460 95 L 490 95", len: 40, accent: true, packet: true },
];

export function ArchitectureDiagram() {
  return (
    <figure className="arch">
      <figcaption className="arch-bar">
        <span className="arch-dot" aria-hidden="true" />
        <span className="arch-dot" aria-hidden="true" />
        <span className="arch-dot" aria-hidden="true" />
        <span className="arch-label">multi-tenant request path</span>
      </figcaption>

      <div className="arch-canvas">
        <svg
          viewBox="0 0 580 190"
          role="img"
          aria-label="Architecture diagram: a client request reaches the edge, where tenant context is resolved. The API handler and background queue both pass through a row-level security boundary that enforces tenant isolation before any query reaches the shared Postgres database."
        >
          {WIRES.map((wire, i) => (
            <path
              key={wire.d}
              d={wire.d}
              className={`arch-wire${wire.accent ? " arch-wire-accent" : ""}`}
              style={
                {
                  "--len": wire.len,
                  "--i": i,
                } as React.CSSProperties
              }
            />
          ))}

          {/* Requests travelling the happy path. */}
          {WIRES.filter((w) => w.packet).map((wire, i) => (
            <circle
              key={`packet-${wire.d}`}
              r={3}
              className="arch-packet"
              style={
                {
                  "--path": `path("${wire.d}")`,
                  "--i": i,
                } as React.CSSProperties
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
                rx={6}
                className={`arch-node${node.accent ? " arch-node-accent" : ""}`}
              />
              <text
                x={node.x + node.w / 2}
                y={node.y + 20}
                textAnchor="middle"
                className={`arch-text${node.accent ? " arch-text-accent" : ""}`}
              >
                {node.title}
              </text>
              <text
                x={node.x + node.w / 2}
                y={node.y + 34}
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
          <span className="arch-legend-swatch" style={{ color: "var(--accent)" }} />
          tenant-scoped
        </span>
        <span className="arch-legend-item">
          <span
            className="arch-legend-swatch"
            style={{ color: "var(--line-strong)" }}
          />
          unscoped
        </span>
        <span className="arch-legend-item">
          Isolation enforced below the application, not in it.
        </span>
      </div>
    </figure>
  );
}
