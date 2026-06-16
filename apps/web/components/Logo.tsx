import Image from 'next/image';

interface LogoProps {
  /** Height in px — width scales automatically */
  height?: number;
  className?: string;
  /** Set true only for the very first above-the-fold logo (header) */
  priority?: boolean;
}

/**
 * Industry-standard logo implementation:
 * - SVG files served as static assets (CDN-cached, browser-cached across pages)
 * - <picture> element switches between dark/light variants natively — no JS
 * - `priority` on the header logo injects a <link rel="preload"> in <head>
 */
export default function Logo({ height = 32, className = '', priority = false }: LogoProps) {
  return (
    <picture className={className}>
      {/* Dark mode → use light logo (white/light text on dark bg) */}
      <source
        srcSet="/logo-light.svg"
        media="(prefers-color-scheme: dark)"
      />
      {/* Light mode (default) → use dark logo */}
      <Image
        src="/logo-dark.svg"
        alt="AI Startup Impact"
        width={0}
        height={height}
        priority={priority}
        style={{ width: 'auto', height: `${height}px` }}
        className="block"
      />
    </picture>
  );
}
