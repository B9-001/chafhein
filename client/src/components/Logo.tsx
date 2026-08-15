type LogoProps = {
  className?: string;
  title?: boolean;
};

// Brand mark now uses the official CHAFHEIN logo image, served from
// client/public/logo.png so it works everywhere the app is hosted
// (no external image dependency / no proxy that could 404).
export function LogoMark({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <img
      src="/logo.png"
      alt="CHAFHEIN logo"
      className={`${className} object-contain`}
    />
  );
}

export function Logo({ className = "h-10 w-10", title = true }: LogoProps) {
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark className={className} />
      {title && (
        <span className="text-2xl font-bold bg-gradient-to-r from-purple-700 to-yellow-600 bg-clip-text text-transparent tracking-tight">
          CHAFHEIN
        </span>
      )}
    </div>
  );
}
