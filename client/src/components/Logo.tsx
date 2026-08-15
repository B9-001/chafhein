type LogoProps = {
  className?: string;
  title?: boolean;
};

// Brand mark uses the official CHAFHEIN logo image, served from
// client/public/logo.png so it works everywhere the app is hosted
// (no external image dependency / no proxy that could 404). The
// image already includes the CHAFHEIN wordmark, so we intentionally
// don't render a separate text label next to it.
export function LogoMark({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <img
      src="/logo.png"
      alt="CHAFHEIN logo"
      className={`${className} object-contain`}
    />
  );
}

export function Logo({ className = "h-10 w-10" }: LogoProps) {
  return <LogoMark className={className} />;
}
