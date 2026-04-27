/* Professor Rafael — Aplicações fora do Instagram.
   YouTube (thumb + banner), E-book (capa + miolo), Site, Slide, LinkedIn.
*/

/* ==================== YOUTUBE THUMBNAIL ==================== */
const YTThumb = ({ theme = 'A', title, eyebrow, emotion = '😤', style = {} }) => (
  <ThemeScope theme={theme} style={{
    width: 640, height: 360, background: 'var(--paper)',
    color: 'var(--ink)', fontFamily: 'var(--font-sans)',
    position: 'relative', overflow: 'hidden',
    border: '1px solid rgba(0,0,0,0.1)',
    ...style,
  }}>
    {/* lado da foto */}
    <div style={{
      position: 'absolute', right: 0, top: 0, bottom: 0, width: 280,
    }}>
      <RafaelPhoto variant="speaking" width={280} height={360} />
      <div style={{
        position: 'absolute', top: 40, left: 30, color: 'var(--pen)',
      }}>
        <PenCircle width={230} height={230} stroke={6} rotate={-4} />
      </div>
    </div>

    {/* eyebrow */}
    <div style={{
      position: 'absolute', top: 28, left: 28,
      fontFamily: 'var(--font-mono)', fontSize: 12,
      letterSpacing: '0.14em', textTransform: 'uppercase',
      color: 'var(--brand)', fontWeight: 600,
    }}>
      {eyebrow || 'Escola Real #12'}
    </div>

    {/* título */}
    <div style={{
      position: 'absolute', top: 72, left: 28, right: 300,
      fontFamily: 'var(--font-display)', fontWeight: 700,
      fontSize: 46, lineHeight: 0.98, letterSpacing: '-0.035em',
      color: 'var(--ink)',
    }}>
      {title || (<>Por que você <em style={{ color: 'var(--brand)' }}>sente culpa</em> no fim do dia?</>)}
    </div>

    {/* selo */}
    <div style={{
      position: 'absolute', bottom: 24, left: 28,
      background: 'var(--ink)', color: 'var(--paper)',
      fontFamily: 'var(--font-display)', fontWeight: 700,
      padding: '8px 14px', fontSize: 14, letterSpacing: '0.02em',
      transform: 'rotate(-1.5deg)',
    }}>
      Prof. Rafael
    </div>
  </ThemeScope>
);

/* ==================== YOUTUBE BANNER ==================== */
const YTBanner = ({ theme = 'A', style = {} }) => (
  <ThemeScope theme={theme} style={{
    width: 1152, height: 216, background: 'var(--paper)',
    color: 'var(--ink)', fontFamily: 'var(--font-sans)',
    position: 'relative', overflow: 'hidden',
    display: 'flex', alignItems: 'center', gap: 40, padding: '0 80px',
    border: '1px solid rgba(0,0,0,0.1)',
    ...style,
  }}>
    <RafaelAvatar size={140} penColor="var(--brand)" />

    <div style={{ flex: 1 }}>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 11,
        letterSpacing: '0.18em', textTransform: 'uppercase',
        color: 'var(--ink-soft)', marginBottom: 8,
      }}>
        Professor · Palestrante · Formador
      </div>
      <div style={{
        fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 700,
        letterSpacing: '-0.03em', lineHeight: 1, color: 'var(--ink)',
      }}>
        A escola real — com humor,
      </div>
      <div style={{
        fontFamily: 'var(--font-display)', fontSize: 40,
        fontWeight: 400, fontStyle: 'italic',
        letterSpacing: '-0.03em', lineHeight: 1.1, color: 'var(--brand)',
      }}>
        memória e ferramentas.
      </div>
    </div>

    <div style={{ color: 'var(--pen)' }}>
      <PenCircle width={150} height={80} stroke={4} rotate={2} />
    </div>
  </ThemeScope>
);

/* ==================== E-BOOK COVER ==================== */
const EbookCover = ({ theme = 'A', title, subtitle, number = '01', style = {} }) => (
  <ThemeScope theme={theme} style={{
    width: 380, height: 520, background: 'var(--paper)',
    color: 'var(--ink)', fontFamily: 'var(--font-sans)',
    position: 'relative', overflow: 'hidden',
    boxShadow: '0 20px 40px -15px rgba(0,0,0,0.3)',
    ...style,
  }}>
    {/* faixa lateral — vocabulário "livro" */}
    <div style={{
      position: 'absolute', left: 0, top: 0, bottom: 0, width: 28,
      background: 'var(--brand)', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 10,
        color: 'var(--paper)', letterSpacing: '0.3em',
        textTransform: 'uppercase', writingMode: 'vertical-rl',
        transform: 'rotate(180deg)',
      }}>
        Coleção Escola Real · N° {number}
      </div>
    </div>

    <div style={{
      position: 'absolute', top: 40, left: 56, right: 32,
      fontFamily: 'var(--font-mono)', fontSize: 10,
      letterSpacing: '0.16em', textTransform: 'uppercase',
      color: 'var(--ink-soft)',
    }}>
      E-book · Prof. Rafael
    </div>

    <div style={{
      position: 'absolute', top: 120, left: 56, right: 36,
      fontFamily: 'var(--font-display)', fontWeight: 700,
      fontSize: 44, lineHeight: 0.96, letterSpacing: '-0.035em',
      color: 'var(--ink)',
    }}>
      {title || (<>
        Como dar aula<br />
        <em style={{ color: 'var(--brand)', fontWeight: 600 }}>sem virar</em>
        <span style={{ position: 'relative', display: 'inline-block' }}>
          {' '}super‑herói.
          <span style={{ position: 'absolute', left: 0, right: 0, bottom: -8, color: 'var(--pen)' }}>
            <PenUnderline width="100%" height={12} stroke={3} rotate={-1} />
          </span>
        </span>
      </>)}
    </div>

    <div style={{
      position: 'absolute', top: 330, left: 56, right: 40,
      fontFamily: 'var(--font-quote)', fontStyle: 'italic',
      fontSize: 16, lineHeight: 1.35, color: 'var(--ink-2)',
    }}>
      {subtitle || '12 ferramentas concretas para trabalhar com menos desgaste e mais critério.'}
    </div>

    <div style={{
      position: 'absolute', bottom: 36, left: 56, right: 40,
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
    }}>
      <RafaelLogo variant="inline" color="var(--ink)" penColor="var(--brand)" size={0.6} />
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 10,
        color: 'var(--ink-soft)', textAlign: 'right',
      }}>
        ed. 2026<br />68 páginas
      </div>
    </div>
  </ThemeScope>
);

/* ==================== E-BOOK INTERIOR (miolo) ==================== */
const EbookInterior = ({ theme = 'A', style = {} }) => (
  <ThemeScope theme={theme} style={{
    width: 380, height: 520, background: 'var(--paper)',
    color: 'var(--ink)', fontFamily: 'var(--font-sans)',
    position: 'relative', overflow: 'hidden',
    boxShadow: '0 20px 40px -15px rgba(0,0,0,0.3)',
    padding: '48px 40px 40px', ...style,
  }}>
    {/* cabeçalho de capítulo */}
    <div style={{
      fontFamily: 'var(--font-mono)', fontSize: 10,
      letterSpacing: '0.14em', textTransform: 'uppercase',
      color: 'var(--ink-soft)', display: 'flex', justifyContent: 'space-between',
      marginBottom: 24,
    }}>
      <span>Capítulo 03</span>
      <span>p. 42</span>
    </div>

    <div style={{
      fontFamily: 'var(--font-display)', fontSize: 30,
      fontWeight: 700, letterSpacing: '-0.025em',
      lineHeight: 1.05, marginBottom: 4,
    }}>
      A aula <em style={{ color: 'var(--brand)' }}>imperfeita</em>
    </div>
    <div style={{
      fontFamily: 'var(--font-quote)', fontStyle: 'italic',
      fontSize: 14, color: 'var(--ink-soft)', marginBottom: 22,
    }}>
      e a pressão de uma que não existe
    </div>

    {/* drop cap + parágrafo */}
    <p style={{
      fontSize: 12.5, lineHeight: 1.55, color: 'var(--ink-2)',
      textIndent: 0, marginBottom: 12,
    }}>
      <span style={{
        float: 'left', fontFamily: 'var(--font-display)', fontWeight: 700,
        fontSize: 48, lineHeight: 0.9, padding: '4px 8px 0 0',
        color: 'var(--brand)',
      }}>
        N
      </span>
      enhum professor acorda pronto para performar a versão mais carismática de si mesmo. Mas é isso que a cultura pedagógica insiste em exigir: entusiasmo, disrupção, empatia sem limite — todo dia, cinco turmas por dia.
    </p>
    <p style={{
      fontSize: 12.5, lineHeight: 1.55, color: 'var(--ink-2)', marginBottom: 12,
    }}>
      Este capítulo propõe o oposto:{' '}
      <span className="marker-highlight" style={{ '--marker-color': 'var(--highlight)' }}>
        uma aula que funciona sem depender do seu humor
      </span>. Estruturas, não performances.
    </p>

    {/* callout */}
    <div style={{
      marginTop: 14, padding: '14px 16px 14px 18px',
      borderLeft: '3px solid var(--pen)',
      background: 'var(--paper-2)',
      fontFamily: 'var(--font-quote)', fontStyle: 'italic',
      fontSize: 13, lineHeight: 1.45, color: 'var(--ink)',
    }}>
      “Devemos trabalhar com os professores normais.”
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 9, fontStyle: 'normal',
        letterSpacing: '0.1em', textTransform: 'uppercase',
        color: 'var(--ink-soft)', marginTop: 6,
      }}>
        — Bernard Charlot, 2010
      </div>
    </div>

    <div style={{
      position: 'absolute', bottom: 20, left: 40, right: 40,
      display: 'flex', justifyContent: 'space-between',
      fontFamily: 'var(--font-mono)', fontSize: 9,
      color: 'var(--ink-soft)', letterSpacing: '0.08em',
    }}>
      <span>Prof. Rafael · Coleção Escola Real</span>
      <span>42</span>
    </div>
  </ThemeScope>
);

/* ==================== SITE HERO ==================== */
const SiteHero = ({ theme = 'A', style = {} }) => (
  <ThemeScope theme={theme} style={{
    width: 1200, height: 720, background: 'var(--paper)',
    color: 'var(--ink)', fontFamily: 'var(--font-sans)',
    position: 'relative', overflow: 'hidden',
    border: '1px solid rgba(0,0,0,0.1)',
    ...style,
  }}>
    {/* nav */}
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: 72,
      display: 'flex', alignItems: 'center',
      padding: '0 56px', borderBottom: '1px solid rgba(0,0,0,0.08)',
      justifyContent: 'space-between', zIndex: 2,
    }}>
      <RafaelLogo variant="compact" color="var(--ink)" penColor="var(--brand)" size={0.9} />
      <div style={{
        display: 'flex', gap: 32, fontSize: 14, color: 'var(--ink-2)', fontWeight: 500,
      }}>
        <span>E‑books</span>
        <span>Vídeos</span>
        <span>Palestras</span>
        <span>Sobre</span>
      </div>
      <div style={{
        padding: '10px 22px', background: 'var(--brand)',
        color: 'var(--paper)', fontSize: 13, fontWeight: 600,
        letterSpacing: '0.02em', borderRadius: 2,
      }}>
        Entrar na lista
      </div>
    </div>

    {/* hero */}
    <div style={{
      position: 'absolute', top: 110, left: 56, right: 56, bottom: 56,
      display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 48,
    }}>
      <div>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 11,
          letterSpacing: '0.18em', textTransform: 'uppercase',
          color: 'var(--ink-soft)', marginBottom: 24,
        }}>
          Prof. Rafael · escola real, com método.
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 82, fontWeight: 700,
          letterSpacing: '-0.04em', lineHeight: 0.95,
          color: 'var(--ink)', margin: 0,
        }}>
          Dar aula sem<br />
          virar{' '}
          <span style={{ position: 'relative', color: 'var(--brand)', fontStyle: 'italic', fontWeight: 600 }}>
            super‑herói.
            <span style={{
              position: 'absolute', left: '-2%', right: '-2%', bottom: '-0.12em',
              color: 'var(--pen)',
            }}>
              <PenUnderline width="104%" height={22} stroke={4} rotate={-1.5} />
            </span>
          </span>
        </h1>
        <p style={{
          fontFamily: 'var(--font-quote)', fontStyle: 'italic',
          fontSize: 22, lineHeight: 1.35, color: 'var(--ink-2)',
          maxWidth: 520, marginTop: 28,
        }}>
          Um jeito menos desgastante (e mais honesto) de estar em sala. E‑books, vídeos e formações para professores reais.
        </p>

        <div style={{ display: 'flex', gap: 14, marginTop: 32 }}>
          <div style={{
            padding: '16px 28px', background: 'var(--ink)',
            color: 'var(--paper)', fontSize: 14, fontWeight: 600,
            letterSpacing: '0.02em',
          }}>
            Ver e‑books →
          </div>
          <div style={{
            padding: '16px 28px', border: '1.5px solid var(--ink)',
            color: 'var(--ink)', fontSize: 14, fontWeight: 600,
          }}>
            Assistir no YouTube
          </div>
        </div>

        <div style={{
          marginTop: 40, display: 'flex', gap: 28,
          fontFamily: 'var(--font-mono)', fontSize: 11,
          color: 'var(--ink-soft)', letterSpacing: '0.1em', textTransform: 'uppercase',
        }}>
          <span>120k+ professores</span>
          <span>·</span>
          <span>4 e‑books publicados</span>
          <span>·</span>
          <span>Palestras sob demanda</span>
        </div>
      </div>

      {/* coluna direita: cartão com foto + mini-produto */}
      <div style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute', top: 0, right: 0, width: 320, height: 380,
          border: '1px solid rgba(0,0,0,0.08)',
        }}>
          <RafaelPhoto variant="classroom" width={320} height={380} />
        </div>
        {/* card e-book sobreposto */}
        <div style={{
          position: 'absolute', bottom: 20, left: 0, width: 220,
          background: 'var(--paper)', padding: 20,
          boxShadow: '0 20px 40px -15px rgba(0,0,0,0.35)',
          border: '1px solid rgba(0,0,0,0.08)',
        }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 10,
            letterSpacing: '0.15em', textTransform: 'uppercase',
            color: 'var(--brand)', fontWeight: 600, marginBottom: 10,
          }}>
            Novo e‑book
          </div>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: 22,
            fontWeight: 700, lineHeight: 1, letterSpacing: '-0.025em',
            color: 'var(--ink)',
          }}>
            A aula imperfeita
          </div>
          <div style={{
            marginTop: 14,
            fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700,
            color: 'var(--pen)', letterSpacing: '-0.02em',
          }}>
            R$ 29
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 10,
            color: 'var(--ink-soft)', marginTop: 2,
          }}>
            PDF + EPUB
          </div>
        </div>
      </div>
    </div>
  </ThemeScope>
);

/* ==================== PALESTRA SLIDE (16:9) ==================== */
const PalestraSlide = ({ theme = 'A', style = {} }) => (
  <ThemeScope theme={theme} style={{
    width: 720, height: 405, background: 'var(--paper)',
    color: 'var(--ink)', fontFamily: 'var(--font-sans)',
    position: 'relative', overflow: 'hidden',
    padding: '36px 48px', border: '1px solid rgba(0,0,0,0.1)', ...style,
  }}>
    <div style={{
      fontFamily: 'var(--font-mono)', fontSize: 10,
      letterSpacing: '0.18em', textTransform: 'uppercase',
      color: 'var(--ink-soft)',
    }}>
      01 · A escola real
    </div>

    <div style={{
      fontFamily: 'var(--font-display)', fontSize: 64,
      fontWeight: 700, lineHeight: 0.98, letterSpacing: '-0.035em',
      marginTop: 40, color: 'var(--ink)', maxWidth: 560,
    }}>
      Professor não é <span style={{ color: 'var(--brand)' }}>missionário</span>.
    </div>
    <div style={{
      fontFamily: 'var(--font-quote)', fontStyle: 'italic',
      fontSize: 22, color: 'var(--ink-2)', marginTop: 18, maxWidth: 560,
    }}>
      E isso é uma boa notícia.
    </div>

    <div style={{
      position: 'absolute', bottom: 24, left: 48, right: 48,
      display: 'flex', justifyContent: 'space-between',
      fontFamily: 'var(--font-mono)', fontSize: 10,
      color: 'var(--ink-soft)', letterSpacing: '0.1em', textTransform: 'uppercase',
    }}>
      <span>Prof. Rafael · 2026</span>
      <span>01/28</span>
    </div>

    {/* marcação decorativa */}
    <div style={{ position: 'absolute', right: 38, top: 120, color: 'var(--pen)', opacity: 0.7 }}>
      <PenCircle width={120} height={100} stroke={3} rotate={8} />
    </div>
  </ThemeScope>
);

/* ==================== LINKEDIN SIGNATURE ==================== */
const LinkedInHeader = ({ theme = 'A', style = {} }) => (
  <ThemeScope theme={theme} style={{
    width: 700, height: 200, background: 'var(--paper)',
    color: 'var(--ink)', fontFamily: 'var(--font-sans)',
    position: 'relative', overflow: 'hidden',
    border: '1px solid rgba(0,0,0,0.1)',
    padding: '28px 36px', display: 'flex',
    alignItems: 'center', gap: 24, ...style,
  }}>
    <RafaelAvatar size={128} penColor="var(--brand)" />
    <div>
      <div style={{
        fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 700,
        letterSpacing: '-0.025em', color: 'var(--ink)', lineHeight: 1,
      }}>
        Rafael da Silva
      </div>
      <div style={{
        fontFamily: 'var(--font-quote)', fontStyle: 'italic',
        fontSize: 17, color: 'var(--brand)', marginTop: 6,
      }}>
        Professor · Palestrante · Formador de docentes
      </div>
      <div style={{
        fontSize: 13, color: 'var(--ink-2)', marginTop: 12,
        lineHeight: 1.45, maxWidth: 420,
      }}>
        Traduzo a escola real — com humor, memória histórica e ferramentas práticas — para professores que querem ensinar com menos desgaste.
      </div>
      <div style={{
        marginTop: 10, display: 'flex', gap: 14,
        fontFamily: 'var(--font-mono)', fontSize: 10,
        color: 'var(--ink-soft)', letterSpacing: '0.12em', textTransform: 'uppercase',
      }}>
        <span>youtube.com/@profrafael</span>
        <span>·</span>
        <span>profrafael.com.br</span>
      </div>
    </div>
  </ThemeScope>
);

Object.assign(window, {
  YTThumb, YTBanner,
  EbookCover, EbookInterior,
  SiteHero, PalestraSlide, LinkedInHeader,
});
