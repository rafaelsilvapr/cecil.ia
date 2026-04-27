/* Professor Rafael — Primitivos de marca
   Logo, monograma, avatar, assinatura, placeholders de foto.
*/

/* ============ LOGO PRINCIPAL ============
   'Prof. Rafael' em Fraunces, com marcação de caneta sobre 'Rafael'.
   props: variant = 'stacked' | 'inline' | 'compact'
          onDark = boolean
          color  = cor do texto (default: currentColor)
          penColor = cor da caneta
*/
const RafaelLogo = ({
  variant = 'stacked',
  color = 'currentColor',
  penColor,
  size = 1,
  style = {},
}) => {
  const actualPen = penColor || color;
  if (variant === 'compact') {
    return (
      <div style={{
        fontFamily: 'var(--font-display)',
        color,
        fontWeight: 700,
        letterSpacing: '-0.02em',
        fontSize: 24 * size,
        lineHeight: 1,
        ...style,
      }}>
        Prof. <span style={{ color: actualPen, fontStyle: 'italic', fontWeight: 500 }}>Rafael</span>
      </div>
    );
  }
  if (variant === 'inline') {
    return (
      <div style={{
        fontFamily: 'var(--font-display)',
        color,
        fontWeight: 700,
        letterSpacing: '-0.025em',
        fontSize: 36 * size,
        lineHeight: 1,
        display: 'flex',
        alignItems: 'baseline',
        gap: '0.2em',
        ...style,
      }}>
        <span style={{ fontWeight: 500 }}>Prof.</span>
        <span style={{ position: 'relative' }}>
          Rafael
          <span style={{
            position: 'absolute', left: '-4%', right: '-4%', bottom: '-0.18em',
            color: actualPen, pointerEvents: 'none',
          }}>
            <PenUnderline width="108%" height={18 * size} stroke={2.5 * size} rotate={-1} />
          </span>
        </span>
      </div>
    );
  }
  // stacked
  return (
    <div style={{
      fontFamily: 'var(--font-display)',
      color,
      lineHeight: 0.92,
      ...style,
    }}>
      <div style={{
        fontSize: 18 * size, fontWeight: 500, letterSpacing: '0.12em',
        textTransform: 'uppercase', opacity: 0.7, marginBottom: 6 * size,
      }}>
        Prof.
      </div>
      <div style={{
        fontSize: 64 * size, fontWeight: 700, letterSpacing: '-0.03em',
        position: 'relative', display: 'inline-block',
      }}>
        Rafael
        <span style={{
          position: 'absolute', left: '-3%', right: '-3%', bottom: '-0.15em',
          color: actualPen, pointerEvents: 'none',
        }}>
          <PenUnderline width="106%" height={24 * size} stroke={3 * size} rotate={-1.5} />
        </span>
      </div>
    </div>
  );
};

/* ============ MONOGRAMA ============
   'PR' circular desenhado à mão, para avatar, favicon, selo. */
const RafaelMonogram = ({ size = 80, bg = 'transparent', color = 'currentColor', penColor }) => {
  const actualPen = penColor || color;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: bg, position: 'relative',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <div style={{ position: 'absolute', inset: 0, color: actualPen }}>
        <HandDrawnFrame size={size} color={actualPen} stroke={size * 0.025} />
      </div>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 700, letterSpacing: '-0.04em',
        color, fontSize: size * 0.44, lineHeight: 1,
      }}>
        PR
      </div>
    </div>
  );
};

/* ============ AVATAR COM FOTO ============ */
const RafaelAvatar = ({ size = 80, src = 'assets/rafael-classroom.png', objectPosition = '50% 20%', color = 'currentColor', penColor }) => {
  const actualPen = penColor || color;
  return (
    <div style={{
      width: size, height: size, position: 'relative', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        width: size * 0.88, height: size * 0.88, borderRadius: '50%',
        overflow: 'hidden', background: '#ddd',
      }}>
        <img
          src={src}
          alt="Professor Rafael"
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition }}
        />
      </div>
      <div style={{ position: 'absolute', inset: 0, color: actualPen }}>
        <HandDrawnFrame size={size} color={actualPen} stroke={Math.max(2, size * 0.025)} />
      </div>
    </div>
  );
};

/* ============ ASSINATURA (avatar + nome) ============
   Usada como cabeçalho de carrossel, LinkedIn, slide. */
const RafaelSignature = ({
  size = 1,
  color = 'var(--ink, #1F2220)',
  penColor = 'var(--brand, #5A6B3A)',
  handle = '@professorrafaeldasilva',
  showHandle = true,
  style = {},
}) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 14 * size,
    fontFamily: 'var(--font-sans)', color, ...style,
  }}>
    <RafaelAvatar size={56 * size} color={penColor} />
    <div style={{ lineHeight: 1.1 }}>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 700, fontSize: 22 * size,
        letterSpacing: '-0.02em', color: penColor,
      }}>
        Professor Rafael
      </div>
      {showHandle && (
        <div style={{
          fontSize: 13 * size, opacity: 0.6, fontWeight: 500,
          letterSpacing: '-0.005em',
        }}>
          {handle}
        </div>
      )}
    </div>
  </div>
);

/* ============ PLACEHOLDER DE FOTO ============
   Para onde deveria entrar uma foto real — textura sutil + caption. */
const PhotoPlaceholder = ({
  width = 400, height = 260, caption = 'foto do Rafael',
  color = 'var(--ink-soft, #6B6F6A)', bg = 'var(--paper-2, #EBE4D6)',
  style = {},
}) => (
  <div style={{
    width, height, background: bg,
    position: 'relative', overflow: 'hidden',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    ...style,
  }}>
    <div style={{
      position: 'absolute', inset: 0,
      backgroundImage: `repeating-linear-gradient(
        135deg,
        transparent 0 14px,
        ${color.includes('var') ? 'rgba(0,0,0,0.06)' : color} 14px 15px
      )`,
      opacity: 0.5,
    }} />
    <div style={{
      fontFamily: 'var(--font-mono)', fontSize: 12, color,
      background: bg, padding: '4px 10px',
      position: 'relative', letterSpacing: '0.02em',
    }}>
      {caption}
    </div>
  </div>
);

/* Foto do Rafael em diferentes contextos — variantes controlam crop */
const RAFAEL_PHOTOS = {
  classroom: { src: 'assets/rafael-classroom.png', pos: '50% 30%' },
  speaking:  { src: 'assets/rafael-speaking.jpg',  pos: '45% 35%' },
  portrait:  { src: 'assets/rafael-classroom.png', pos: '50% 22%' }, // close face
};

const RafaelPhoto = ({
  variant = 'classroom', width = 400, height = 260,
  style = {}, overlay = null,
}) => {
  const p = RAFAEL_PHOTOS[variant] || RAFAEL_PHOTOS.classroom;
  return (
    <div style={{
      width, height, position: 'relative', overflow: 'hidden',
      background: 'var(--paper-2)', ...style,
    }}>
      <img
        src={p.src} alt="Professor Rafael"
        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: p.pos }}
      />
      {overlay}
    </div>
  );
};

Object.assign(window, {
  RafaelLogo, RafaelMonogram, RafaelAvatar, RafaelSignature, PhotoPlaceholder,
  RafaelPhoto,
});
