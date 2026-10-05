/**
 * PageLayout — responsive wrapper that adds a decorative side panel on wider screens.
 *
 * On md+ screens: 40% left panel (branding + illustration) | 60% content area
 * On mobile:       side panel hidden, children render full-width as before
 *
 * @param {React.ReactNode} children        - The screen content to render
 * @param {string}          panelHighlight  - Bold amber accent line (e.g. "See it. Report it.")
 * @param {string}          panelDescription - Supporting text below the highlight
 */
export default function PageLayout({ children, panelHighlight, panelDescription }) {
  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-screen">
      {/* ── Decorative side panel (hidden on mobile) ───────────── */}
      <div className="hidden md:flex md:w-2/5 bg-slate-800 flex-col items-center justify-center px-8 py-10 text-center">
        {/* Branding */}
        <div className="text-5xl mb-5">🌍</div>
        <h2 className="text-2xl font-bold text-white mb-2">GroundTruth</h2>
        <p className="text-slate-400 text-sm mb-8">
          Hyperlocal Hazard Reporting
        </p>

        {/* Illustration area — layered warning icon */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-amber-500/10 rounded-full blur-2xl scale-150" />
          <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-slate-700 border-2 border-amber-500/30">
            <span className="text-4xl">⚠️</span>
          </div>
        </div>

        {/* Dynamic tagline — driven by props from the current screen */}
        <p className="text-slate-300 text-sm leading-relaxed max-w-[220px]">
          <span className="text-amber-400 font-medium">{panelHighlight}</span>
          <br />
          {panelDescription}
        </p>
      </div>

      {/* ── Content area ─────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-4 py-5">
        <div className="w-full max-w-lg">
          {children}
        </div>
      </div>
    </div>
  )
}
