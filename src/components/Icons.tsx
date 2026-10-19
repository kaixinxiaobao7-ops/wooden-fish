import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function SunIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.4 5.4l1.5 1.5M17.1 17.1l1.5 1.5M18.6 5.4l-1.5 1.5M6.9 17.1l-1.5 1.5" />
    </svg>
  );
}

export function MoonIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M20 14.4A8.4 8.4 0 0 1 9.6 4a8.4 8.4 0 1 0 10.4 10.4Z" />
    </svg>
  );
}

export function VolumeIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 9.5v5h3.4L13 18.6V5.4L7.4 9.5H4Z" />
      <path d="M16.4 8.7a4.6 4.6 0 0 1 0 6.6M18.9 6.2a8.1 8.1 0 0 1 0 11.6" />
    </svg>
  );
}

export function VolumeOffIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 9.5v5h3.4L13 18.6V5.4L7.4 9.5H4Z" />
      <path d="m16.5 9.5 5 5M21.5 9.5l-5 5" />
    </svg>
  );
}

export function ChartIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 20h16M6.5 20v-6M11 20V8.5M15.5 20v-9M20 20V5" />
    </svg>
  );
}

export function SlidersIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
      <circle cx="15" cy="7" r="2" />
      <circle cx="9" cy="17" r="2" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

export function PlayIcon(props: IconProps) {
  return (
    <svg {...base} {...props} fill="currentColor" stroke="none">
      <path d="M8 5.6a1 1 0 0 1 1.5-.87l9 6.4a1 1 0 0 1 0 1.74l-9 6.4A1 1 0 0 1 8 18.4V5.6Z" />
    </svg>
  );
}

export function PauseIcon(props: IconProps) {
  return (
    <svg {...base} {...props} fill="currentColor" stroke="none">
      <rect x="6" y="5" width="4.2" height="14" rx="1.4" />
      <rect x="13.8" y="5" width="4.2" height="14" rx="1.4" />
    </svg>
  );
}

export function ResetIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4.5 5.5v4.2h4.2" />
      <path d="M5.2 9.4a8 8 0 1 1-1 4.3" />
    </svg>
  );
}

export function SparkIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3.5c.8 4.7 3 7 7.5 7.8-4.5.8-6.7 3.1-7.5 7.8-.8-4.7-3-7-7.5-7.8C9 10.5 11.2 8.2 12 3.5Z" />
      <path d="M18.8 16.5c.3 1.8 1.1 2.7 3 3-1.9.3-2.7 1.2-3 3-.3-1.8-1.2-2.7-3-3 1.8-.3 2.7-1.2 3-3Z" />
    </svg>
  );
}

export function ScrollIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6 4.5h11a2.5 2.5 0 0 1 0 5H8.5a2.5 2.5 0 0 0 0 5H18a2.5 2.5 0 0 1 0 5H7" />
      <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4H7v16h-.5A2.5 2.5 0 0 1 4 17.5v-11Z" />
    </svg>
  );
}

export function ShareIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 15V4M8 7.5 12 3.5l4 4" />
      <path d="M5 12.5v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" />
    </svg>
  );
}

export function KeyboardIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="6.5" width="18" height="11" rx="2.2" />
      <path d="M7 10h.01M10.3 10h.01M13.6 10h.01M17 10h.01M8 13.8h8" />
    </svg>
  );
}
