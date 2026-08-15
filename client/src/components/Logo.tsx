type LogoProps = {
  className?: string;
  title?: boolean;
};

// Self-contained brand mark — no external image dependency (the old logo
// pointed at Manus's storage proxy, which 404s outside the Manus platform).
export function LogoMark({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} role="img" aria-label="CHAFHEIN logo">
      <defs>
        <linearGradient id="logo-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="55%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#fbbf24" />
        </linearGradient>
      </defs>
      <circle cx="20" cy="20" r="20" fill="url(#logo-grad)" />
      <path
        d="M20 29.5c-.35 0-.7-.12-.98-.35-1.6-1.32-3.15-2.6-4.5-3.87C10.98 21.9 9 19.5 9 16.6 9 13.9 11.1 12 13.6 12c1.5 0 2.95.72 3.9 1.9l.5.63.5-.63c.95-1.18 2.4-1.9 3.9-1.9 1.5 0 2.95.72 3.9 1.9 1.6 2 1.36 4.8-.5 6.9-1.4 1.58-3.5 3.4-5.3 4.9-.5.43-1 .85-1.5 1.25-.28.23-.63.35-.98.35z"
        fill="white"
        opacity="0.95"
      />
    </svg>
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
