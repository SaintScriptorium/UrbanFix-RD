// Layout compartido por Login y Registro. El panel izquierdo es el único
// elemento "de marca" de todo el flujo de autenticación: un perfil de
// skyline abstracto que representa el urbanismo del que nace UrbanFix RD.
// El resto de la interfaz se mantiene deliberadamente sobrio para que ese
// panel sea lo único que el usuario recuerde.
export default function AuthLayout({ eyebrow, title, subtitle, children }) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-asphalt-50">
      <aside className="relative md:w-5/12 bg-blueprint-950 text-white overflow-hidden">
        <div className="relative z-10 flex flex-col justify-between h-full px-8 py-10 md:px-12 md:py-14">
          <span className="font-display text-lg tracking-tight">UrbanFix RD</span>

          <div className="hidden md:block">
            <p className="font-display text-3xl leading-snug max-w-sm">
              El estado real de tu calle, visible para toda la ciudad.
            </p>
            <p className="mt-4 text-asphalt-100/70 text-sm max-w-xs">
              Reporta hoyos, aceras rotas y luminarias apagadas. Cada reporte
              queda a la vista de tu comunidad.
            </p>
          </div>

          <span className="text-xs text-asphalt-100/50 hidden md:block">
            República Dominicana · MVP
          </span>
        </div>

        {/* Skyline abstracto: siluetas de edificios de altura variable con
            un acento de ventanas en ámbar, apoyado en la línea de base del
            panel. Puramente decorativo — aria-hidden. */}
        <svg
          aria-hidden="true"
          viewBox="0 0 480 220"
          preserveAspectRatio="none"
          className="absolute bottom-0 left-0 w-full h-40 md:h-56 opacity-90"
        >
          <g fill="#1B3B5B">
            <rect x="0" y="120" width="46" height="100" />
            <rect x="52" y="80" width="34" height="140" />
            <rect x="92" y="140" width="52" height="80" />
            <rect x="150" y="60" width="30" height="160" />
            <rect x="186" y="100" width="44" height="120" />
            <rect x="236" y="40" width="36" height="180" />
            <rect x="278" y="110" width="48" height="110" />
            <rect x="332" y="70" width="30" height="150" />
            <rect x="368" y="130" width="52" height="90" />
            <rect x="426" y="90" width="54" height="130" />
          </g>
          <g fill="#E8963A" opacity="0.85">
            <rect x="8" y="134" width="6" height="8" />
            <rect x="22" y="134" width="6" height="8" />
            <rect x="8" y="152" width="6" height="8" />
            <rect x="62" y="98" width="6" height="8" />
            <rect x="62" y="116" width="6" height="8" />
            <rect x="196" y="118" width="6" height="8" />
            <rect x="210" y="118" width="6" height="8" />
            <rect x="246" y="58" width="6" height="8" />
            <rect x="246" y="76" width="6" height="8" />
            <rect x="342" y="88" width="6" height="8" />
            <rect x="436" y="108" width="6" height="8" />
            <rect x="450" y="108" width="6" height="8" />
          </g>
        </svg>
      </aside>

      <main className="flex-1 flex items-center justify-center px-6 py-12 md:py-0">
        <div className="w-full max-w-sm">
          <p className="text-signal-600 text-sm font-medium tracking-wide uppercase mb-2">
            {eyebrow}
          </p>
          <h1 className="font-display text-2xl text-asphalt-800 mb-1">{title}</h1>
          <p className="text-asphalt-600 text-sm mb-8">{subtitle}</p>
          {children}
        </div>
      </main>
    </div>
  );
}
