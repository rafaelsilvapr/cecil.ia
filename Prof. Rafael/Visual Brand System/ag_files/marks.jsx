/* Professor Rafael — Marcações "caneta de professor" em SVG.
   Todas são componentes React puros. currentColor herda a cor do pai.
   Assinatura: <PenCircle />, <PenUnderline />, <PenArrow />, <PenCheck />, <PenBracket />
*/

const PenCircle = ({ width = 260, height = 120, stroke = 4, style = {}, rotate = -2 }) => (
  <svg
    viewBox="0 0 260 120"
    width={width}
    height={height}
    style={{ overflow: 'visible', transform: `rotate(${rotate}deg)`, ...style }}
    aria-hidden="true"
  >
    <path
      d="M 20 60
         C 20 20, 80 10, 140 12
         C 210 14, 248 35, 246 62
         C 244 92, 195 108, 130 110
         C 55 112, 16 94, 18 62
         C 20 30, 90 18, 160 22"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ filter: 'url(#penRough)' }}
    />
    <defs>
      <filter id="penRough">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="3" />
        <feDisplacementMap in="SourceGraphic" scale="1.2" />
      </filter>
    </defs>
  </svg>
);

const PenUnderline = ({ width = 240, height = 28, stroke = 4, style = {}, rotate = -1 }) => (
  <svg
    viewBox="0 0 240 28"
    width={width}
    height={height}
    style={{ overflow: 'visible', transform: `rotate(${rotate}deg)`, ...style }}
    aria-hidden="true"
  >
    <path
      d="M 6 18
         C 40 10, 80 22, 120 14
         C 160 8, 200 20, 234 12"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
    />
    <path
      d="M 10 22
         C 50 16, 90 26, 130 20
         C 170 14, 210 24, 232 18"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke * 0.55}
      strokeLinecap="round"
      opacity="0.5"
    />
  </svg>
);

const PenArrow = ({ width = 120, height = 80, stroke = 3, style = {}, rotate = 0 }) => (
  <svg
    viewBox="0 0 120 80"
    width={width}
    height={height}
    style={{ overflow: 'visible', transform: `rotate(${rotate}deg)`, ...style }}
    aria-hidden="true"
  >
    <path
      d="M 8 12
         C 30 20, 60 40, 82 58
         M 82 58 L 72 42
         M 82 58 L 62 54"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PenCheck = ({ size = 48, stroke = 4, style = {} }) => (
  <svg viewBox="0 0 48 48" width={size} height={size} style={{ overflow: 'visible', ...style }} aria-hidden="true">
    <path
      d="M 6 26 C 10 24, 14 28, 18 34 C 24 24, 32 14, 44 6"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PenBracket = ({ height = 160, stroke = 3, style = {}, side = 'left' }) => {
  const path = side === 'left'
    ? "M 24 4 C 10 10, 6 40, 8 80 C 10 120, 10 150, 24 156"
    : "M 6 4 C 20 10, 24 40, 22 80 C 20 120, 20 150, 6 156";
  return (
    <svg viewBox="0 0 30 160" width={30} height={height} style={{ overflow: 'visible', ...style }} aria-hidden="true">
      <path d={path} fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" />
    </svg>
  );
};

/* "Margem de caderno" — linha vertical + picotado (usado em e-book, site) */
const NotebookMargin = ({ height = 400, color = 'currentColor', style = {} }) => (
  <svg viewBox={`0 0 40 ${height}`} width={40} height={height} style={{ overflow: 'visible', ...style }} aria-hidden="true">
    <line x1="32" y1="0" x2="32" y2={height} stroke={color} strokeWidth="1" opacity="0.25" />
    <line x1="36" y1="0" x2="36" y2={height} stroke={color} strokeWidth="1" opacity="0.25" />
    {Array.from({ length: Math.floor(height / 24) }).map((_, i) => (
      <circle key={i} cx="14" cy={16 + i * 24} r="1.6" fill={color} opacity="0.35" />
    ))}
  </svg>
);

/* Textura de papel sutil — aplicar como background-image */
const PaperNoise = ({ opacity = 0.06, style = {} }) => (
  <svg
    style={{
      position: 'absolute', inset: 0, width: '100%', height: '100%',
      pointerEvents: 'none', opacity, mixBlendMode: 'multiply', ...style,
    }}
    aria-hidden="true"
  >
    <filter id="paperN">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" />
      <feColorMatrix values="0 0 0 0 0.1  0 0 0 0 0.1  0 0 0 0 0.1  0 0 0 0.5 0" />
    </filter>
    <rect width="100%" height="100%" filter="url(#paperN)" />
  </svg>
);

/* Moldura desenhada à mão para fotos (herda do avatar atual) */
const HandDrawnFrame = ({ size = 200, color = 'currentColor', stroke = 3, style = {} }) => (
  <svg viewBox="0 0 200 200" width={size} height={size} style={{ overflow: 'visible', ...style }} aria-hidden="true">
    <circle
      cx="100" cy="100" r="94"
      fill="none" stroke={color} strokeWidth={stroke}
      strokeDasharray="1 0"
      style={{ filter: 'url(#frameRough)' }}
    />
    <defs>
      <filter id="frameRough">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="7" />
        <feDisplacementMap in="SourceGraphic" scale="2" />
      </filter>
    </defs>
  </svg>
);

Object.assign(window, {
  PenCircle, PenUnderline, PenArrow, PenCheck, PenBracket,
  NotebookMargin, PaperNoise, HandDrawnFrame,
});
