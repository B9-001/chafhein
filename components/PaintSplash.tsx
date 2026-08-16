type PaintSplashProps = {
  color?: "purple" | "purpleDark" | "gold";
  className?: string;
};

const COLORS: Record<NonNullable<PaintSplashProps["color"]>, string> = {
  purple: "#7C3AED",
  purpleDark: "#4C1D95",
  gold: "#FBBF24",
};

/**
 * Decorative hand-painted brush-stroke blob used as an accent near photos
 * and section headings, echoing the brand's paint-splash visual language.
 * Purely decorative — safe to place with `aria-hidden` and absolute
 * positioning; never carries layout-affecting content.
 */
export function PaintSplash({ color = "purple", className = "h-16 w-20" }: PaintSplashProps) {
  return (
    <svg
      viewBox="0 0 120 90"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill={COLORS[color]}
        d="M14 8.6C29-2.9 60-4 76 8.6c14 11 34 15 40 30 6 16-8 27-24 33-14 5-16 20-33 22C62 96 47 84 33 76 17 67-2 60 1 42 4 26 1 18 14 8.6Z"
      />
    </svg>
  );
}
