/* Professor Rafael — Wrappers de tema e amostras de guia.
   ThemeScope injeta as variáveis --paper, --ink, --brand etc.
   usando o prefixo (A, B, C) que corresponde à direção escolhida.
*/

const THEMES = {
  A: {
    label: 'Direção A · Sala de Aula',
    tagline: 'Verde-oliva refinado + terracota',
    vars: {
      '--paper': 'var(--a-paper)',
      '--paper-2': 'var(--a-paper-2)',
      '--ink': 'var(--a-ink)',
      '--ink-2': 'var(--a-ink-2)',
      '--ink-soft': 'var(--a-ink-soft)',
      '--brand': 'var(--a-brand)',
      '--brand-dark': 'var(--a-brand-dark)',
      '--accent': 'var(--a-accent)',
      '--highlight': 'var(--a-highlight)',
      '--pen': 'var(--a-pen)',
      '--line': 'var(--a-line)',
    },
  },
  B: {
    label: 'Direção B · Aterrado',
    tagline: 'Creme + laranja-terra · inspiração Claude',
    vars: {
      '--paper': 'var(--b-paper)',
      '--paper-2': 'var(--b-paper-2)',
      '--ink': 'var(--b-ink)',
      '--ink-2': 'var(--b-ink-2)',
      '--ink-soft': 'var(--b-ink-soft)',
      '--brand': 'var(--b-brand)',
      '--brand-dark': 'var(--b-brand-dark)',
      '--accent': 'var(--b-accent)',
      '--highlight': 'var(--b-highlight)',
      '--pen': 'var(--b-pen)',
      '--line': 'var(--b-line)',
    },
  },
  C: {
    label: 'Direção C · Manifesto',
    tagline: 'Editorial contrastante · terracota vibrante',
    vars: {
      '--paper': 'var(--c-paper)',
      '--paper-2': 'var(--c-paper-2)',
      '--ink': 'var(--c-ink)',
      '--ink-inv': 'var(--c-ink-inv)',
      '--ink-2': 'var(--c-ink-2)',
      '--ink-soft': 'var(--c-ink-soft)',
      '--brand': 'var(--c-brand)',
      '--brand-dark': 'var(--c-brand-dark)',
      '--accent': 'var(--c-accent)',
      '--highlight': 'var(--c-highlight)',
      '--pen': 'var(--c-pen)',
      '--line': 'var(--c-line)',
    },
  },
};

const ThemeScope = ({ theme = 'B', children, style = {}, ...rest }) => {
  const vars = THEMES[theme]?.vars || {};
  return (
    <div style={{ ...vars, ...style }} {...rest}>
      {children}
    </div>
  );
};

/* ============ SWATCH ============ */
const ColorSwatch = ({ name, token, value, textColor = '#1F2220', large = false }) => (
  <div style={{
    width: large ? 140 : 90,
    display: 'flex', flexDirection: 'column', gap: 6,
  }}>
    <div style={{
      width: '100%', height: large ? 140 : 90,
      background: value, borderRadius: 4,
      border: '1px solid rgba(0,0,0,0.08)',
    }} />
    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: textColor, lineHeight: 1.3 }}>
      <div style={{ fontWeight: 500 }}>{name}</div>
      <div style={{ opacity: 0.55 }}>{value}</div>
    </div>
  </div>
);

/* ============ TYPOGRAPHY SPECIMEN ============ */
const TypeSpecimen = ({ fontFamily, label, role, sample, size = 48, weight = 400, italic = false, color = 'var(--ink)' }) => (
  <div style={{ paddingBottom: 20, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
    <div style={{
      fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.06em',
      textTransform: 'uppercase', color: 'var(--ink-soft)', marginBottom: 10,
      display: 'flex', justifyContent: 'space-between',
    }}>
      <span>{label}</span>
      <span>{role}</span>
    </div>
    <div style={{
      fontFamily, fontSize: size, fontWeight: weight,
      fontStyle: italic ? 'italic' : 'normal',
      color, lineHeight: 1.05, letterSpacing: '-0.02em',
    }}>
      {sample}
    </div>
  </div>
);

/* ============ DIREÇÃO CARD ============
   Cabeçalho da coluna de cada direção, no canvas comparativo. */
const DirectionHeader = ({ theme = 'A', letter = 'A', subtitle }) => {
  const t = THEMES[theme];
  return (
    <ThemeScope theme={theme} style={{
      background: 'var(--paper)', color: 'var(--ink)',
      padding: '28px 32px', border: '1px solid rgba(0,0,0,0.08)',
      borderRadius: 8, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 6,
      }}>
        <div style={{
          fontFamily: 'var(--font-display)', fontWeight: 700,
          fontSize: 88, lineHeight: 0.9, color: 'var(--brand)',
          letterSpacing: '-0.04em',
        }}>
          {letter}
        </div>
        <div>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 11,
            letterSpacing: '0.12em', textTransform: 'uppercase',
            color: 'var(--ink-soft)',
          }}>
            Direção
          </div>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: 26,
            fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.02em',
          }}>
            {t.label.split('·')[1]?.trim()}
          </div>
        </div>
      </div>
      <div style={{
        fontFamily: 'var(--font-sans)', fontSize: 14,
        color: 'var(--ink-2)', maxWidth: 420,
      }}>
        {subtitle || t.tagline}
      </div>
    </ThemeScope>
  );
};

Object.assign(window, {
  THEMES, ThemeScope, ColorSwatch, TypeSpecimen, DirectionHeader,
});
