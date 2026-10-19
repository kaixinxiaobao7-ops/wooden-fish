/**
 * The mallet is decorative and pointer-transparent; the whole fish remains
 * one large, forgiving tap target.
 */
export function Mallet() {
  return (
    <svg className="mallet-svg" viewBox="0 0 280 280" aria-hidden="true">
      <defs>
        <linearGradient id="wf-handle" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--mallet-dark)" />
          <stop offset="55%" stopColor="var(--mallet-mid)" />
          <stop offset="100%" stopColor="var(--mallet-light)" />
        </linearGradient>
        <radialGradient id="wf-head" cx="34%" cy="28%" r="80%">
          <stop offset="0%" stopColor="var(--mallet-light)" />
          <stop offset="55%" stopColor="var(--mallet-mid)" />
          <stop offset="100%" stopColor="var(--mallet-dark)" />
        </radialGradient>
        <filter id="wf-mallet-shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="3" dy="8" stdDeviation="7" floodColor="#2a1405" floodOpacity="0.35" />
        </filter>
      </defs>

      <g filter="url(#wf-mallet-shadow)">
        <line
          x1="62"
          y1="232"
          x2="170"
          y2="86"
          stroke="url(#wf-handle)"
          strokeWidth="20"
          strokeLinecap="round"
        />
        <line
          x1="72"
          y1="226"
          x2="164"
          y2="98"
          stroke="var(--mallet-light)"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.3"
        />
        <circle cx="188" cy="64" r="41" fill="url(#wf-head)" />
        <ellipse cx="175" cy="51" rx="17" ry="23" fill="#fff4dd" opacity="0.16" transform="rotate(-30 175 51)" />
        <path
          d="M156 88c8 10 22 16 37 15"
          fill="none"
          stroke="var(--mallet-dark)"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.35"
        />
        <circle cx="162" cy="92" r="5" fill="var(--accent)" opacity="0.7" />
      </g>
    </svg>
  );
}
