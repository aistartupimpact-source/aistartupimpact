import Image from 'next/image';

interface LogoProps {
  /** Height in px — width scales automatically */
  height?: number;
  className?: string;
  /** Set true only for the very first above-the-fold logo (header) */
  priority?: boolean;
  /** Force the light logo variant (white/light text) regardless of active theme */
  forceLight?: boolean;
}

/**
 * Industry-standard logo implementation:
 * - SVG files served as static assets
 * - Switches between dark/light variants based on Tailwind CSS class (.dark on html/body)
 * - `forceLight` parameter ensures only the light-colored logo is rendered (e.g. for footers)
 * - `priority` on the header logo injects a <link rel="preload"> in <head>
 */
export default function Logo({
  height = 32,
  className = '',
  priority = false,
  forceLight = false,
}: LogoProps) {
  if (forceLight) {
    return (
      <Image
        src="/logo-dark.svg"
        alt="AI Startup Impact"
        width={0}
        height={height}
        priority={priority}
        style={{ width: 'auto', height: `${height}px` }}
        className={`block ${className}`}
      />
    );
  }

  return (
    <>
      {/* Light mode → use light theme logo (dark text) */}
      <Image
        src="/logo-light.svg"
        alt="AI Startup Impact"
        width={0}
        height={height}
        priority={priority}
        style={{ width: 'auto', height: `${height}px` }}
        className={`block dark:hidden ${className}`}
      />
      {/* Dark mode → use dark theme logo (white text) */}
      <Image
        src="/logo-dark.svg"
        alt="AI Startup Impact"
        width={0}
        height={height}
        priority={priority}
        style={{ width: 'auto', height: `${height}px` }}
        className={`hidden dark:block ${className}`}
      />
    </>
  );
}

