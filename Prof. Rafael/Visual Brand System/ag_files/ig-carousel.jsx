/* Professor Rafael — Aplicações em carrossel Instagram.
   Proporção 4:5 (1080x1350) — padrão. Todas as peças vivem dentro de <ThemeScope>.
*/

const IG_W = 540;
const IG_H = 675;

const IGFrame = ({ children, theme = 'A', style = {} }) => (
  <ThemeScope theme={theme} style={{
    width: IG_W, height: IG_H,
    background: 'var(--paper)',
    color: 'var(--ink)',
    fontFamily: 'var(--font-sans)',
    position: 'relative', overflow: 'hidden',
    boxShadow: '0 10px 30px -10px rgba(0,0,0,0.15)',
    borderRadius: 2,
    ...style,
  }}>
    {/* textura sutil de papel */}
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none',
      backgroundImage: `
        radial-gradient(rgba(0,0,0,0.025) 1px, transparent 1.5px),
        radial-gradient(rgba(0,0,0,0.015) 1px, transparent 2px)
      `,
      backgroundSize: '4px 4px, 9px 9px',
      backgroundPosition: '0 0, 2px 3px',
      mixBlendMode: 'multiply',
    }} />
    {children}
  </ThemeScope>
);

/* Cabeçalho padrão (avatar + nome + handle) — usado em quase todos os slides */
const IGHeader = ({ small = false }) => (
  <div style={{
    position: 'absolute', top: 28, left: 28, right: 28,
    display: 'flex', alignItems: 'center', gap: 12, zIndex: 3,
  }}>
    <RafaelAvatar size={small ? 40 : 52} penColor="var(--brand)" />
    <div style={{ lineHeight: 1.05 }}>
      <div style={{
        fontFamily: 'var(--font-display)', fontWeight: 700,
        fontSize: small ? 16 : 19, color: 'var(--brand)',
        letterSpacing: '-0.02em',
      }}>
        Professor Rafael
      </div>
      <div style={{
        fontSize: 11, color: 'var(--ink-soft)', marginTop: 2,
      }}>
        @professorrafaeldasilva
      </div>
    </div>
  </div>
);

/* ================================================================
   SLIDE 1 — CAPA (pergunta de impacto)
   Baseado no card #1 original, mas tipográfico em vez de colagem.
   ================================================================ */
const IGCover = ({ theme = 'A' }) => (
  <IGFrame theme={theme}>
    <div style={{
      position: 'absolute', top: 28, left: 28,
      fontFamily: 'var(--font-mono)', fontSize: 10,
      letterSpacing: '0.18em', textTransform: 'uppercase',
      color: 'var(--ink-soft)',
    }}>
      Pergunta #08 · Escola Real
    </div>

    <div style={{
      position: 'absolute', top: 120, left: 32, right: 32,
    }}>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: 46, lineHeight: 1.02, fontWeight: 700,
        letterSpacing: '-0.035em', color: 'var(--ink)',
      }}>
        Todo professor tem que ser uma{' '}
        <span style={{
          color: 'var(--brand)', fontStyle: 'italic', fontWeight: 600,
          position: 'relative', whiteSpace: 'nowrap',
        }}>
          cruza de super‑herói
          <span style={{
            position: 'absolute', left: '-2%', right: '-2%', bottom: '-0.18em',
            color: 'var(--pen)',
          }}>
            <PenUnderline width="104%" height={14} stroke={3} rotate={-1.5} />
          </span>
        </span>
          {' '}com Miss Simpatia?
      </div>
    </div>

    {/* marcação manual canto inferior */}
    <div style={{ position: 'absolute', right: 44, bottom: 110, color: 'var(--pen)' }}>
      <PenCircle width={140} height={70} stroke={3.5} rotate={4} />
    </div>
    <div style={{
      position: 'absolute', right: 48, bottom: 76,
      fontFamily: 'var(--font-hand)', fontSize: 22,
      color: 'var(--pen)', transform: 'rotate(-4deg)',
    }}>
      spoiler: não.
    </div>

    <div style={{
      position: 'absolute', bottom: 28, left: 28, right: 28,
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
      fontSize: 11, color: 'var(--ink-soft)',
    }}>
      <RafaelLogo variant="compact" color="var(--ink)" size={0.7} />
      <span style={{ fontFamily: 'var(--font-mono)' }}>arrasta →</span>
    </div>
  </IGFrame>
);

/* ================================================================
   SLIDE 2 — PRESSÃO (pergunta espelho + bloco de imagem/placeholder)
   Baseado no card #2 original.
   ================================================================ */
const IGPressure = ({ theme = 'A' }) => (
  <IGFrame theme={theme}>
    <IGHeader />

    <div style={{
      position: 'absolute', top: 116, left: 32, right: 32,
      fontFamily: 'var(--font-display)', fontWeight: 700,
      fontSize: 27, lineHeight: 1.15, letterSpacing: '-0.02em',
      color: 'var(--ink)',
    }}>
      Uma pessoa que escolhe a profissão de professor precisa{' '}
      <span className="marker-highlight" style={{ '--marker-color': 'var(--highlight)' }}>
        abrir mão da sua personalidade
      </span>?
    </div>

    <div style={{
      position: 'absolute', left: 32, right: 32, top: 290, height: 240,
    }}>
      <RafaelPhoto variant="speaking" width="100%" height={240} />
    </div>

    <div style={{
      position: 'absolute', left: 32, right: 32, bottom: 40,
      fontFamily: 'var(--font-sans)', fontSize: 15, lineHeight: 1.4,
      color: 'var(--ink-2)', fontStyle: 'italic',
    }}>
      Precisa forçar uma personalidade extrovertida, carinhosa, criativa‑disruptiva para fazer bem o seu trabalho?
    </div>
  </IGFrame>
);

/* ================================================================
   SLIDE 3 — PONTE / CHARLOT
   Card de transição autoral.
   ================================================================ */
const IGBridge = ({ theme = 'A' }) => (
  <IGFrame theme={theme}>
    <IGHeader />

    <div style={{
      position: 'absolute', top: 180, left: 32, right: 32,
      fontFamily: 'var(--font-display)', fontSize: 38,
      lineHeight: 1.08, fontWeight: 700,
      letterSpacing: '-0.03em', color: 'var(--ink)',
    }}>
      O educador francês{' '}
      <span style={{ color: 'var(--brand)' }}>Bernard Charlot</span>{' '}
      falou sobre isso de um jeito muito{' '}
      <span style={{
        position: 'relative', color: 'var(--pen)', fontStyle: 'italic',
      }}>
        bom.
      </span>
    </div>

    {/* foto + legenda */}
    <div style={{
      position: 'absolute', right: 28, bottom: 28,
      width: 180, textAlign: 'center',
    }}>
      <div style={{
        width: 180, height: 180, background: 'var(--paper-2)',
        border: '1px solid rgba(0,0,0,0.08)', position: 'relative',
      }}>
        <PhotoPlaceholder width={180} height={180} caption="Bernard Charlot" />
      </div>
      <div style={{
        fontFamily: 'var(--font-quote)', fontSize: 14,
        fontStyle: 'italic', color: 'var(--ink-2)',
        marginTop: 8,
      }}>
        Bernard Charlot (1944–2025)
      </div>
    </div>

    <div style={{
      position: 'absolute', left: 38, bottom: 60,
      fontFamily: 'var(--font-hand)', fontSize: 32,
      color: 'var(--pen)', transform: 'rotate(-6deg)',
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      veja
      <PenArrow width={48} height={32} stroke={3} rotate={10} />
    </div>
  </IGFrame>
);

/* ================================================================
   SLIDE 4 — CITAÇÃO (fundo alternado em creme)
   Charlot citado. Instrument Serif italic dá tom editorial.
   ================================================================ */
const IGQuote = ({ theme = 'A' }) => (
  <IGFrame theme={theme}>
    <IGHeader />

    {/* aspas decorativas grandes */}
    <div style={{
      position: 'absolute', top: 96, left: 28,
      fontFamily: 'var(--font-display)', fontSize: 160,
      lineHeight: 0.8, color: 'var(--brand)', opacity: 0.25,
      fontWeight: 700,
    }}>
      “
    </div>

    <div style={{
      position: 'absolute', top: 170, left: 50, right: 40,
      fontFamily: 'var(--font-quote)', fontStyle: 'italic',
      fontSize: 26, lineHeight: 1.3, color: 'var(--ink)',
    }}>
      Devemos trabalhar com os professores{' '}
      <span style={{ textDecoration: 'line-through', opacity: 0.5 }}>ideais</span>{' '}
      <span className="marker-highlight" style={{
        '--marker-color': 'var(--highlight)',
        fontStyle: 'normal', fontFamily: 'var(--font-display)', fontWeight: 600,
      }}>
        normais
      </span>. Há exemplos como a Escola da Ponte, em Portugal, que impressionam. Mas esse é o problema: ela está{' '}
      <span style={{ color: 'var(--pen)', fontStyle: 'italic' }}>fora da norma.</span>
    </div>

    <div style={{
      position: 'absolute', bottom: 40, left: 32,
      fontFamily: 'var(--font-mono)', fontSize: 11,
      color: 'var(--ink-soft)', letterSpacing: '0.04em',
    }}>
      CHARLOT, 2010 · p.150
    </div>
  </IGFrame>
);

/* ================================================================
   SLIDE 5 — DADO (colagem Brasil, baseado no card #6 original)
   ================================================================ */
const IGData = ({ theme = 'A' }) => (
  <IGFrame theme={theme}>
    <IGHeader small />

    <div style={{
      position: 'absolute', top: 115, left: 28, right: 28,
      padding: '28px 28px 32px', background: 'var(--paper-2)',
      border: '1.5px solid var(--ink)',
    }}>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 10,
        letterSpacing: '0.14em', textTransform: 'uppercase',
        color: 'var(--ink-soft)', marginBottom: 14,
      }}>
        No Brasil, hoje
      </div>
      <div style={{
        fontFamily: 'var(--font-display)', fontSize: 54,
        lineHeight: 1, fontWeight: 700, color: 'var(--ink)',
        letterSpacing: '-0.04em', marginBottom: 8,
      }}>
        2.300.000
      </div>
      <div style={{
        fontFamily: 'var(--font-display)', fontSize: 22,
        fontWeight: 500, color: 'var(--ink-2)',
        letterSpacing: '-0.01em',
      }}>
        professores.
      </div>
    </div>

    <div style={{
      position: 'absolute', bottom: 32, left: 32, right: 32,
      fontFamily: 'var(--font-display)', fontSize: 22,
      lineHeight: 1.22, fontWeight: 500,
      letterSpacing: '-0.015em', color: 'var(--ink)',
    }}>
      Não são <span style={{
        textDecoration: 'line-through', textDecorationColor: 'var(--pen)',
        textDecorationThickness: 3, color: 'var(--ink-soft)',
      }}>2.300.000 heróis</span>. São trabalhadores que querem fazer um bom trabalho — e não podemos exigir que sejam todos{' '}
      <span style={{ color: 'var(--pen)', fontStyle: 'italic' }}>
        santos, militantes, heróis.
      </span>
    </div>
  </IGFrame>
);

/* ================================================================
   SLIDE 6 — FECHAMENTO AUTORAL + CTA
   ================================================================ */
const IGCta = ({ theme = 'A' }) => (
  <IGFrame theme={theme}>
    {/* marcação grande como grafismo de fundo */}
    <div style={{
      position: 'absolute', top: 140, left: 80, color: 'var(--brand)', opacity: 0.18,
    }}>
      <PenCircle width={380} height={220} stroke={10} rotate={-4} />
    </div>

    <div style={{
      position: 'absolute', top: 80, left: 0, right: 0,
      display: 'flex', justifyContent: 'center',
    }}>
      <RafaelMonogram size={90} bg="var(--paper-2)" color="var(--ink)" penColor="var(--brand)" />
    </div>

    <div style={{
      position: 'absolute', top: 210, left: 32, right: 32, textAlign: 'center',
      fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 700,
      lineHeight: 1.02, color: 'var(--ink)', letterSpacing: '-0.035em',
    }}>
      Professor não precisa ser <em style={{ color: 'var(--brand)' }}>herói.</em>
      <br />
      Precisa de{' '}
      <span style={{ position: 'relative', color: 'var(--pen)' }}>
        repertório.
      </span>
    </div>

    {/* CTA botão com pincelada */}
    <div style={{
      position: 'absolute', bottom: 130, left: 0, right: 0,
      display: 'flex', justifyContent: 'center',
    }}>
      <div style={{
        padding: '14px 36px', background: 'var(--brand)',
        color: 'var(--paper)', fontFamily: 'var(--font-display)',
        fontWeight: 700, fontSize: 16, letterSpacing: '0.08em',
        textTransform: 'uppercase', borderRadius: 2,
        position: 'relative', transform: 'rotate(-1.5deg)',
        boxShadow: '3px 3px 0 var(--ink)',
      }}>
        seguir Prof. Rafael
      </div>
    </div>

    <div style={{
      position: 'absolute', bottom: 36, left: 0, right: 0, textAlign: 'center',
      display: 'flex', justifyContent: 'center', gap: 22, color: 'var(--ink-soft)',
      fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em',
      textTransform: 'uppercase',
    }}>
      <span>♡ curtir</span>
      <span>◌ comentar</span>
      <span>↗ compartilhar</span>
      <span>⎙ salvar</span>
    </div>
  </IGFrame>
);

Object.assign(window, {
  IGFrame, IGHeader,
  IGCover, IGPressure, IGBridge, IGQuote, IGData, IGCta,
});
