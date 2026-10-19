import type { SkinId } from '../lib/game';

interface WoodenFishProps {
  skin: SkinId;
}

/**
 * Hand-carved wooden fish, drawn entirely in SVG so it scales crisply and
 * its colours can be driven by the selected skin.
 */
export function WoodenFish({ skin }: WoodenFishProps) {
  return (
    <svg
      className="wooden-fish"
      data-skin={skin}
      viewBox="0 0 520 470"
      role="img"
      aria-label="一只圆润的木鱼，安放在红色蒲团上"
    >
      <defs>
        <radialGradient id="wf-body" cx="33%" cy="22%" r="88%">
          <stop offset="0%" stopColor="var(--fish-light)" />
          <stop offset="42%" stopColor="var(--fish-mid)" />
          <stop offset="80%" stopColor="var(--fish-deep)" />
          <stop offset="100%" stopColor="var(--fish-dark)" />
        </radialGradient>
        <radialGradient id="wf-tail" cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor="var(--fish-mid)" />
          <stop offset="70%" stopColor="var(--fish-deep)" />
          <stop offset="100%" stopColor="var(--fish-dark)" />
        </radialGradient>
        <linearGradient id="wf-slit" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--fish-dark)" />
          <stop offset="55%" stopColor="var(--fish-rim)" />
          <stop offset="100%" stopColor="var(--fish-deep)" stopOpacity="0.92" />
        </linearGradient>
        <radialGradient id="wf-cushion" cx="50%" cy="16%" r="88%">
          <stop offset="0%" stopColor="var(--cushion-1)" />
          <stop offset="70%" stopColor="var(--cushion-2)" />
          <stop offset="100%" stopColor="var(--cushion-3)" />
        </radialGradient>
        <radialGradient id="wf-sheen" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff6e2" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#fff6e2" stopOpacity="0" />
        </radialGradient>
        <filter id="wf-soft" x="-40%" y="-60%" width="180%" height="240%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
        <filter id="wf-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <clipPath id="wf-clip">
          <path d="M259 84c88 0 156 62 160 147 4 88-60 154-152 158-92 4-164-50-168-140C95 161 167 84 259 84Z" />
        </clipPath>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="263" cy="442" rx="196" ry="19" fill="var(--shadow)" filter="url(#wf-soft)" opacity="0.55" />

      {/* Cushion */}
      <g className="wf-cushion">
        <ellipse cx="260" cy="410" rx="178" ry="38" fill="var(--cushion-3)" opacity="0.55" />
        <ellipse cx="260" cy="400" rx="176" ry="33" fill="url(#wf-cushion)" />
        <ellipse cx="260" cy="392" rx="150" ry="21" fill="var(--cushion-hi)" opacity="0.35" />
        <path
          d="M91 397c42 34 116 50 169 50s127-16 169-50"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2.2"
          strokeLinecap="round"
          opacity="0.6"
        />
        <path
          d="M108 414c16 16 48 26 76 30M412 414c-16 16-48 26-76 30"
          fill="none"
          stroke="var(--cushion-2)"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.55"
        />
        <circle cx="83" cy="423" r="5" fill="var(--accent)" opacity="0.8" />
        <circle cx="437" cy="423" r="5" fill="var(--accent)" opacity="0.8" />
        <path
          d="M83 428c-6 12-10 22-9 31M437 428c6 12 10 22 9 31"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2"
          opacity="0.7"
        />
      </g>

      {/* Tail fin carved from the same block */}
      <path
        d="M404 232c40-16 60-46 63-86-28 8-54 18-73 34 17 15 21 34 10 52Z"
        fill="url(#wf-tail)"
        stroke="var(--fish-rim)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M416 218c16-18 30-36 40-58M401 205c16-4 33-14 48-28"
        fill="none"
        stroke="var(--fish-rim)"
        strokeWidth="2"
        opacity="0.32"
        strokeLinecap="round"
      />

      {/* Main body */}
      <g className="wf-body">
        <path
          d="M259 84c88 0 156 62 160 147 4 88-60 154-152 158-92 4-164-50-168-140C95 161 167 84 259 84Z"
          fill="url(#wf-body)"
          stroke="var(--fish-rim)"
          strokeWidth="3.5"
        />

        {/* Carved inner rim */}
        <path
          d="M259 104c77 0 133 54 137 126 4 75-51 130-128 134-78 4-140-43-144-120C121 171 181 104 259 104Z"
          fill="none"
          stroke="var(--fish-rim)"
          strokeWidth="1.4"
          opacity="0.22"
        />

        {/* Wood grain */}
        <g clipPath="url(#wf-clip)" opacity="0.42">
          <path
            d="M112 205c54-34 124-44 198-24 36 10 68 26 95 48"
            fill="none"
            stroke="var(--grain)"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <path
            d="M100 253c64-30 148-30 224-2 33 12 61 29 86 50"
            fill="none"
            stroke="var(--grain)"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M104 306c54-20 121-16 184 8 33 13 62 33 85 57"
            fill="none"
            stroke="var(--grain)"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M124 352c57-14 119-6 172 18 22 10 43 24 61 40"
            fill="none"
            stroke="var(--grain)"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <path
            d="M168 129c30-18 63-26 98-27"
            fill="none"
            stroke="var(--grain)"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <path
            d="M299 320c17 12 39 15 58 7M279 345c21 15 50 19 76 9"
            fill="none"
            stroke="var(--grain)"
            strokeWidth="2"
            opacity="0.7"
            strokeLinecap="round"
          />
        </g>

        {/* Soft top-left sheen */}
        <ellipse cx="202" cy="152" rx="104" ry="62" fill="url(#wf-sheen)" transform="rotate(-24 202 152)" />

        {/* Rim light along the top edge */}
        <path
          d="M152 118c30-22 67-34 107-34 37 0 72 11 102 30"
          fill="none"
          stroke="var(--fish-rim-light)"
          strokeWidth="5"
          strokeLinecap="round"
          opacity="0.32"
        />
        <path
          d="M119 332c24 31 65 53 112 57"
          fill="none"
          stroke="var(--fish-rim-light)"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.18"
        />

        {/* Carved mouth / sound slit */}
        <g className="wf-slit">
          <path
            d="M141 279c38 39 105 52 162 30 22-8 41-20 55-34-42 17-93 18-139 6-29-8-55-19-78-33 0 11 0 21 0 31Z"
            fill="url(#wf-slit)"
            stroke="var(--fish-rim)"
            strokeWidth="2.4"
            strokeLinejoin="round"
          />
          <path
            d="M158 289c36 29 91 38 138 23"
            fill="none"
            stroke="var(--fish-rim-light)"
            strokeWidth="1.6"
            strokeLinecap="round"
            opacity="0.24"
          />
        </g>

        {/* Carved eye */}
        <g className="wf-eye">
          <circle cx="334" cy="210" r="17" fill="var(--fish-dark)" opacity="0.68" />
          <circle cx="334" cy="210" r="17" fill="none" stroke="var(--fish-rim)" strokeWidth="2" opacity="0.42" />
          <circle cx="334" cy="210" r="9" fill="none" stroke="var(--fish-light)" strokeWidth="1.4" opacity="0.3" />
          <circle cx="329" cy="205" r="3.5" fill="var(--fish-light)" opacity="0.55" />
          <path
            d="M299 236c10 10 12 24 6 37M316 245c8 8 10 19 6 29"
            fill="none"
            stroke="var(--fish-rim)"
            strokeWidth="2.6"
            strokeLinecap="round"
            opacity="0.4"
          />
        </g>

        {/* Engraved gold stud */}
        <circle cx="252" cy="113" r="4.5" fill="var(--accent)" opacity="0.75" />
        <circle cx="252" cy="113" r="8" fill="none" stroke="var(--accent)" strokeWidth="1" opacity="0.3" />
      </g>

      {/* Warm light pooling under the fish */}
      <ellipse cx="260" cy="384" rx="118" ry="16" fill="var(--accent)" opacity="0.12" filter="url(#wf-glow)" />
    </svg>
  );
}
