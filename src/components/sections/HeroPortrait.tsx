import Image from "next/image";

/**
 * Cut-out portrait over a painted gold stroke.
 *
 * The paint is generated, not an asset: thick strokes pushed through an
 * feTurbulence displacement map, which tears the edges and breaks the body of
 * the stroke the way a loaded brush does. Doing it in SVG keeps it sharp at
 * any size, recolourable from tokens, and about 2KB instead of a PNG.
 *
 * The composition depends on the subject breaking the edges of the shape —
 * contained neatly inside it reads as a sticker, spilling past the top it
 * reads as depth. That is why the image is taller than its stage and the
 * stage does not clip.
 */

interface Props {
  src: string;
  name: string;
  badgeValue: string;
  badgeLabel: string;
}

/** Flecks thrown off the stroke. Hand-placed so they cluster believably. */
const SPECKS: [number, number, number][] = [
  [318, 120, 5],
  [338, 158, 3],
  [300, 92, 3.5],
  [352, 196, 2.5],
  [92, 250, 4],
  [70, 292, 2.5],
  [116, 300, 3],
  [330, 250, 3.5],
  [58, 196, 3],
  [300, 300, 2.5],
];

export function HeroPortrait({ src, name, badgeValue, badgeLabel }: Props) {
  return (
    <div className="portrait-stage">
      <svg
        className="portrait-paint"
        viewBox="0 0 400 400"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <linearGradient id="paint-gold" x1="0.1" y1="0" x2="0.9" y2="1">
            <stop offset="0%" stopColor="var(--paint-from)" />
            <stop offset="48%" stopColor="var(--paint-mid)" />
            <stop offset="100%" stopColor="var(--paint-to)" />
          </linearGradient>

          {/* The whole effect. Fractal noise displaces the stroke outline, so
              the edges tear and thin instead of staying geometric. */}
          <filter
            id="paint-texture"
            x="-25%"
            y="-25%"
            width="150%"
            height="150%"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.018 0.075"
              numOctaves="4"
              seed="11"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="30"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>

          {/* A second, coarser pass for the flecks. */}
          <filter id="speck-texture" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.08"
              numOctaves="3"
              seed="4"
              result="n"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="n"
              scale="14"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>

        <g filter="url(#paint-texture)" fill="none" stroke="url(#paint-gold)">
          {/* The body of the sweep — overlapping strokes of varying weight so
              the interior has density variation rather than flat fill. */}
          <path
            d="M52 262C96 176 168 116 268 96c44-9 76 2 84 34"
            strokeWidth="122"
            strokeLinecap="round"
          />
          <path
            d="M74 300C124 214 196 158 296 146c34-4 56 6 60 28"
            strokeWidth="84"
            strokeLinecap="round"
          />
          <path
            d="M108 330C156 258 214 216 298 210"
            strokeWidth="46"
            strokeLinecap="round"
          />
          {/* Dry-brush trailing hairs. */}
          <path d="M96 336C150 268 226 232 320 226" strokeWidth="7" strokeLinecap="round" />
          <path d="M84 352C142 284 222 250 312 248" strokeWidth="4" strokeLinecap="round" />
          <path d="M300 84C332 78 352 92 356 118" strokeWidth="9" strokeLinecap="round" />
        </g>

        <g filter="url(#speck-texture)" fill="url(#paint-gold)">
          {SPECKS.map(([cx, cy, r]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} />
          ))}
        </g>
      </svg>

      {/* A single dashed arc, echoing the diagram's line language. */}
      <svg
        className="portrait-ring"
        viewBox="0 0 400 400"
        aria-hidden="true"
        focusable="false"
      >
        <circle
          cx="200"
          cy="200"
          r="188"
          fill="none"
          stroke="var(--line-signal)"
          strokeWidth="1"
          strokeDasharray="3 10"
        />
      </svg>

      <Image
        className="portrait-cutout"
        src={src}
        alt={`Portrait of ${name}`}
        width={896}
        height={1195}
        priority
        sizes="(max-width: 1024px) 66vw, 28rem"
      />

      <p className="portrait-badge">
        <span className="portrait-badge-value">{badgeValue}</span>
        <span className="portrait-badge-label">{badgeLabel}</span>
      </p>
    </div>
  );
}
