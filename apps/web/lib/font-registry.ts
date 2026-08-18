export interface FontEntry {
  name: string;
  family: string;
  weights: number[];
  category: "sans-serif" | "serif" | "display" | "monospace";
  googleId: string;
}

export const GOOGLE_FONTS: FontEntry[] = [
  { name: "Inter", family: "Inter", weights: [400, 500, 600, 700], category: "sans-serif", googleId: "Inter" },
  { name: "Plus Jakarta Sans", family: "Plus Jakarta Sans", weights: [400, 500, 600, 700], category: "sans-serif", googleId: "Plus+Jakarta+Sans" },
  { name: "Sora", family: "Sora", weights: [400, 600, 700, 800], category: "sans-serif", googleId: "Sora" },
  { name: "DM Sans", family: "DM Sans", weights: [400, 500, 600, 700], category: "sans-serif", googleId: "DM+Sans" },
  { name: "Outfit", family: "Outfit", weights: [400, 500, 600, 700], category: "sans-serif", googleId: "Outfit" },
  { name: "Space Grotesk", family: "Space Grotesk", weights: [400, 500, 600, 700], category: "sans-serif", googleId: "Space+Grotesk" },
  { name: "Manrope", family: "Manrope", weights: [400, 500, 600, 700, 800], category: "sans-serif", googleId: "Manrope" },
  { name: "General Sans", family: "General Sans", weights: [400, 500, 600, 700], category: "sans-serif", googleId: "General+Sans" },
  { name: "Poppins", family: "Poppins", weights: [400, 500, 600, 700], category: "sans-serif", googleId: "Poppins" },
  { name: "Lora", family: "Lora", weights: [400, 500, 600, 700], category: "serif", googleId: "Lora" },
  { name: "Playfair Display", family: "Playfair Display", weights: [400, 500, 600, 700], category: "serif", googleId: "Playfair+Display" },
  { name: "Source Serif 4", family: "Source Serif 4", weights: [400, 600, 700], category: "serif", googleId: "Source+Serif+4" },
  { name: "Fraunces", family: "Fraunces", weights: [400, 600, 700], category: "serif", googleId: "Fraunces" },
  { name: "Cabinet Grotesk", family: "Cabinet Grotesk", weights: [400, 500, 700, 800], category: "display", googleId: "Cabinet+Grotesk" },
  { name: "Clash Display", family: "Clash Display", weights: [400, 500, 600, 700], category: "display", googleId: "Clash+Display" },
  { name: "JetBrains Mono", family: "JetBrains Mono", weights: [400, 500, 700], category: "monospace", googleId: "JetBrains+Mono" },
];

export type FontRole = "display" | "body";

export interface FontConfig {
  displayFont: string | null;
  bodyFont: string | null;
  customDisplayFontUrl: string | null;
  customBodyFontUrl: string | null;
  customDisplayFontName: string | null;
  customBodyFontName: string | null;
}

export const DEFAULT_FONT_CONFIG: FontConfig = {
  displayFont: "Sora",
  bodyFont: "Plus Jakarta Sans",
  customDisplayFontUrl: null,
  customBodyFontUrl: null,
  customDisplayFontName: null,
  customBodyFontName: null,
};

export function buildGoogleFontsUrl(fonts: string[]): string | null {
  const entries = fonts
    .map((name) => GOOGLE_FONTS.find((f) => f.name === name))
    .filter(Boolean) as FontEntry[];

  if (entries.length === 0) return null;

  const families = entries.map(
    (f) => `family=${f.googleId}:wght@${f.weights.join(";")}`
  );
  return `https://fonts.googleapis.com/css2?${families.join("&")}&display=swap`;
}
