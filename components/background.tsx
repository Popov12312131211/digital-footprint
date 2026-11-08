/**
 * Layered backdrop: dark base, three blurred light sources and a few barely
 * visible abstract shapes. Purely decorative, so it is hidden from assistive tech.
 */
export function Background() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* base */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, var(--background) 0%, var(--background-secondary) 100%)",
        }}
      />

      {/* radial washes */}
      <div
        className="absolute inset-0"
        style={{
          background: [
            "radial-gradient(60% 50% at 8% 0%, var(--blob-blue), transparent 70%)",
            "radial-gradient(55% 55% at 100% 100%, var(--blob-purple), transparent 70%)",
            "radial-gradient(45% 40% at 52% 48%, var(--blob-cyan), transparent 72%)",
          ].join(","),
        }}
      />

      {/* soft colour blooms (no blur filter: the gradient itself is the blur) */}
      <div
        className="absolute -left-[12%] -top-[18%] h-[620px] w-[620px] animate-drift rounded-full opacity-[0.55] will-change-transform"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--accent-blue) 38%, transparent) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute -bottom-[22%] -right-[10%] h-[680px] w-[680px] animate-drift rounded-full opacity-[0.5] will-change-transform"
        style={{
          animationDelay: "-9s",
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--accent-purple) 34%, transparent) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute left-[38%] top-[36%] h-[420px] w-[420px] animate-drift rounded-full opacity-30 will-change-transform"
        style={{
          animationDelay: "-4s",
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--accent-cyan) 32%, transparent) 0%, transparent 70%)",
        }}
      />

      {/* faint abstract forms */}
      <svg
        className="absolute inset-0 h-full w-full opacity-70"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <defs>
          <linearGradient id="bg-stroke" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--accent-blue)" stopOpacity="0.22" />
            <stop offset="1" stopColor="var(--accent-purple)" stopOpacity="0.02" />
          </linearGradient>
          <pattern id="bg-grid" width="64" height="64" patternUnits="userSpaceOnUse">
            <path d="M64 0H0V64" stroke="var(--grid-line)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="1440" height="900" fill="url(#bg-grid)" />
        <circle cx="1120" cy="210" r="260" stroke="url(#bg-stroke)" />
        <circle cx="1120" cy="210" r="360" stroke="url(#bg-stroke)" opacity="0.6" />
        <path d="M-40 720C240 620 420 820 700 720S1180 560 1480 660" stroke="url(#bg-stroke)" />
        <path d="M-40 780C260 690 440 880 720 780S1200 640 1480 730" stroke="url(#bg-stroke)" opacity="0.5" />
      </svg>

      {/* vignette keeps edges calm so content stays the focus */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 40%, transparent 55%, color-mix(in srgb, var(--background) 70%, transparent) 100%)",
        }}
      />
    </div>
  );
}
