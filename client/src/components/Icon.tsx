import type { SVGProps } from 'react';

/** The icon paths of the ÉCLAT design. */
const PATHS: Record<string, string> = {
home: "M3 10 12 3l9 7M5 9v12h5v-7h4v7h5V9",
shop: "M5 7h14l2 14H3L5 7Zm3 1V6a4 4 0 0 1 8 0v2",
camera:
  "M4 6h4l2-3h4l2 3h4a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Zm13 7a5 5 0 1 1-10 0 5 5 0 0 1 10 0Z",
looks: "M4 4h16v16H4V4Zm0 12 5-5 4 4 3-3 4 4M9 8h.01",
heart:
  "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z",
user: "M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 21a8 8 0 0 1 16 0H4Z",
search: "M19 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Zm-2 6 5 6",
bell: "M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM9 21h6",
menu: "M4 6h16M4 12h16M4 18h16",
arrow: "M4 12h16m-6-6 6 6-6 6",
back: "m15 4-8 8 8 8",
down: "m6 9 6 6 6-6",
close: "m6 6 12 12M6 18 18 6",
plus: "M12 4v16M4 12h16",
check: "m4 12 5 5L20 6",
glasses: "M2 9h8l-1 7H4L2 9Zm12 0h8l-2 7h-5l-1-7Zm-4 1h4",
earrings:
  "M8 2a2 2 0 1 1-4 0m12 0a2 2 0 1 1-4 0M6 6c-7 6-5 15 0 15s7-9 0-15Zm12 0c-7 6-5 15 0 15s7-9 0-15Z",
necklace: "M3 2c0 8 5 12 9 15 4-3 9-7 9-15M12 17l3 3-3 3-3-3 3-3Z",
lipstick: "M9 10h6v12H9V10Zm1 0V3l4-2v9M8 15h8",
lips: "M2 12c4-5 7-7 10-4 3-3 6-1 10 4-7 9-13 9-20 0Zm0 0h20",
layers: "m12 2 10 6-10 6L2 8l10-6Zm-9 11 9 5 9-5M3 18l9 5 9-5",
lightning: "m13 2-9 12h7l-1 8 10-13h-7l1-7Z",
shield: "m12 2 8 3v7c0 5-8 10-8 10S4 17 4 12V5l8-3Zm-4 9 3 3 5-6",
chip: "M6 6h12v12H6V6Zm4 4h4v4h-4v-4ZM9 2v4m6-4v4M9 18v4m6-4v4M2 9h4m-4 6h4m12-6h4m-4 6h4",
devices: "M2 3h16v12H2V3Zm5 16h6M10 15v4m5-9h7v12h-7V10Z",
reset: "M3 10a9 9 0 1 1 2 8M3 4v6h6",
share:
  "M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 14a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm3-5 6-4M9 14l6 4",
download: "M12 2v13m-5-5 5 5 5-5M3 15v6h18v-6",
fullscreen: "M3 9V3h6m6 0h6v6m0 6v6h-6M9 21H3v-6",
settings:
  "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm-2-6h4l1 3 3 1 3 3-2 3 1 4-3 3-3-1-3 3-4-1-1-3-3-1-1-4 2-3-1-3 3-3 4 1 2-3Z",
video: "M3 5h12v14H3V5Zm12 5 6-4v12l-6-4",
sliders: "M4 6h16M4 18h16M8 3v6m8 6v6M4 12h16m-4-3v6",
upload:
  "M8 17H6a5 5 0 0 1-1-10 7 7 0 0 1 14 0 5 5 0 0 1-1 10h-2M12 22V10m-4 4 4-4 4 4",
trash: "M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7",
edit: "m4 16 12-12 4 4L8 20H4v-4Zm10-10 4 4",
help: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm-3-14a3 3 0 1 1 5 2c-2 1-2 2-2 4m0 3h.01",
bookmark: "M6 3h12v19l-6-4-6 4V3Z",
filter: "M3 4h18l-7 8v8l-4-2v-6L3 4Z",
more: "M5 12h.01M12 12h.01M19 12h.01",
clock: "M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0ZM12 6v6l4 2",
bag: "M5 6h14l1 15H4L5 6Zm4 0V3h6v3m-7 5 4 3 4-3",
sparkles: "m12 2 2 7 7 3-7 2-2 8-2-8-8-2 8-3 2-7Z",
};

export type IconName = keyof typeof PATHS | (string & {});

export default function Icon({ name, className = '', ...rest }: { name: IconName; className?: string } & Omit<SVGProps<SVGSVGElement>, 'name'>) {
  return (
    <svg
      className={`icon ${className}`.trim()}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      <path d={PATHS[name] || PATHS.sparkles} />
    </svg>
  );
}

export const categoryIcon = (category: string): string =>
  ({ Glasses: 'glasses', Earrings: 'earrings', Necklaces: 'necklace', Makeup: 'lipstick', All: 'layers' })[category] ?? 'sparkles';
