/* Professor Rafael — Guia de marca / Brand OS visual.
   Seção única e longa; dentro do design_canvas fica cada artboard. */

const GuideIntro = () => (
  <ThemeScope theme="A" style={{
    width: 1400, background: 'var(--paper)', color: 'var(--ink)',
    fontFamily: 'var(--font-sans)', padding: '80px 96px', position: 'relative',
  }}>
    <div style={{
      fontFamily: 'var(--font-mono)', fontSize: 12,
      letterSpacing: '0.2em', textTransform: 'uppercase',
      color: 'var(--brand)', marginBottom: 18,
    }}>
      Brand OS · v0.1 · abril 2026
    </div>
    <h1 style={{
      fontFamily: 'var(--font-display)', fontSize: 128, lineHeight: 0.9,
      fontWeight: 700, letterSpacing: '-0.045em', color: 'var(--ink)',
      margin: 0,
    }}>
      Professor<br />
      <span style={{ position: 'relative', color: 'var(--brand)', fontStyle: 'italic', fontWeight: 600 }}>
        Rafael.
        <span style={{
          position: 'absolute', left: '-1%', right: '-1%', bottom: '-0.08em',
          color: 'var(--pen)',
        }}>
          <PenUnderline width="102%" height={40} stroke={6} rotate={-1.5} />
        </span>
      </span>
    </h1>
    <div style={{
      fontFamily: 'var(--font-quote)', fontStyle: 'italic',
      fontSize: 32, lineHeight: 1.3, color: 'var(--ink-2)',
      maxWidth: 880, marginTop: 44,
    }}>
      A voz do professor experiente que traduz a escola real — com humor, memória histórica e ferramentas práticas — para ajudar docentes a ensinar com menos desgaste e mais critério.
    </div>

    <div style={{
      marginTop: 72, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
      gap: 32, paddingTop: 32, borderTop: '1px solid rgba(0,0,0,0.12)',
    }}>
      {['Autoridade', 'Humor', 'Memória histórica', 'Utilidade', 'Leveza'].map((p, i) => (
        <div key={p}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 11,
            color: 'var(--ink-soft)', letterSpacing: '0.14em',
            textTransform: 'uppercase', marginBottom: 8,
          }}>
            Pilar {String(i + 1).padStart(2, '0')}
          </div>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: 24,
            fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--ink)',
          }}>
            {p}
          </div>
        </div>
      ))}
    </div>
  </ThemeScope>
);

const Principles = () => (
  <ThemeScope theme="A" style={{
    width: 1400, background: 'var(--paper)', color: 'var(--ink)',
    fontFamily: 'var(--font-sans)', padding: '64px 96px',
  }}>
    <SectionTitle kicker="Princípios visuais" title="Cinco regras que toda peça precisa respeitar." />

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, marginTop: 40 }}>
      {[
        ['01', 'Humanidade aterrada, não nostalgia.',
          'Usamos texturas suaves, traços manuais e serifa humanista para sugerir um humano honesto — não um passado romantizado. Tecnologia convive com a marca; não é tônica, mas não é inimiga.'],
        ['02', 'Tipografia como protagonista.',
          'A cor não faz o trabalho sozinha. Títulos grandes em Fraunces, itálicos editoriais em Instrument Serif e mono em JetBrains ancoram o caráter autoral. Se a peça depende de um gráfico para funcionar, o texto está errado.'],
        ['03', 'Humor gráfico, não meme.',
          'Marcações de caneta, grifos, riscados e uma ou outra nota manuscrita em Caveat. Sempre pontuais. Humor = gesto, não estética inteira.'],
        ['04', 'Rosto presente em pontos-chave.',
          'Foto do Rafael em capas, thumbs e aberturas. Nos cards de tese e citação, o rosto some para dar lugar ao argumento — o leitor não compete com o autor.'],
        ['05', 'Uma marcação por peça.',
          'Círculo OU sublinhado OU seta OU grifo — nunca os quatro. Cada peça tem um só gesto manuscrito. Mais que isso vira caderno do aluno, não marca.'],
      ].map(([n, t, d]) => (
        <div key={n} style={{ display: 'flex', gap: 20 }}>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: 48,
            fontWeight: 700, color: 'var(--brand)', lineHeight: 0.9,
            letterSpacing: '-0.04em', minWidth: 72,
          }}>{n}</div>
          <div>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: 22,
              fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 8,
            }}>{t}</div>
            <div style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--ink-2)' }}>{d}</div>
          </div>
        </div>
      ))}
    </div>
  </ThemeScope>
);

const SectionTitle = ({ kicker, title, maxWidth = 820 }) => (
  <>
    <div style={{
      fontFamily: 'var(--font-mono)', fontSize: 12,
      letterSpacing: '0.18em', textTransform: 'uppercase',
      color: 'var(--brand)', marginBottom: 14,
    }}>
      {kicker}
    </div>
    <h2 style={{
      fontFamily: 'var(--font-display)', fontSize: 54, fontWeight: 700,
      letterSpacing: '-0.035em', lineHeight: 1, color: 'var(--ink)',
      margin: 0, maxWidth,
    }}>
      {title}
    </h2>
  </>
);

/* ============ DIREÇÕES LADO A LADO ============ */
const DirectionColumn = ({ theme, letter, recommended = false }) => {
  const t = THEMES[theme];
  return (
    <ThemeScope theme={theme} style={{
      flex: 1, background: 'var(--paper)', color: 'var(--ink)',
      padding: '28px 24px 32px', position: 'relative',
      border: recommended ? '2px solid var(--brand)' : '1px solid rgba(0,0,0,0.1)',
      minWidth: 0,
    }}>
      {recommended && (
        <div style={{
          position: 'absolute', top: -14, left: 24,
          background: 'var(--brand)', color: 'var(--paper)',
          fontFamily: 'var(--font-mono)', fontSize: 10,
          fontWeight: 600, letterSpacing: '0.2em',
          textTransform: 'uppercase', padding: '4px 10px',
        }}>
          Recomendada
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 4 }}>
        <div style={{
          fontFamily: 'var(--font-display)', fontSize: 64, fontWeight: 700,
          color: 'var(--brand)', lineHeight: 0.9, letterSpacing: '-0.04em',
        }}>{letter}</div>
        <div style={{
          fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600,
          color: 'var(--ink)', letterSpacing: '-0.02em',
        }}>
          {t.label.split('·')[1]?.trim()}
        </div>
      </div>
      <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginBottom: 20 }}>
        {t.tagline}
      </div>

      {/* Paleta */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6, marginBottom: 20,
      }}>
        {[
          { var: '--paper', label: 'paper' },
          { var: '--paper-2', label: 'paper-2' },
          { var: '--ink', label: 'ink' },
          { var: '--brand', label: 'brand' },
          { var: '--accent', label: 'accent' },
          { var: '--highlight', label: 'high' },
        ].map(c => (
          <div key={c.label}>
            <div style={{
              aspectRatio: '1', background: `var(${c.var})`,
              border: '1px solid rgba(0,0,0,0.08)',
            }} />
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 8,
              color: 'var(--ink-soft)', marginTop: 4, textAlign: 'center',
              letterSpacing: '0.04em',
            }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Título amostra */}
      <div style={{
        fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 700,
        letterSpacing: '-0.03em', lineHeight: 1.02, color: 'var(--ink)',
        marginBottom: 6,
      }}>
        A escola <em style={{ color: 'var(--brand)' }}>real.</em>
      </div>
      <div style={{
        fontFamily: 'var(--font-quote)', fontStyle: 'italic',
        fontSize: 15, color: 'var(--ink-2)', marginBottom: 18,
      }}>
        Humor, memória, ferramentas.
      </div>

      {/* Marcação */}
      <div style={{
        padding: '18px 14px', background: 'var(--paper-2)',
        marginBottom: 18, position: 'relative',
      }}>
        <div style={{ fontSize: 13, color: 'var(--ink)' }}>
          Professor não precisa ser{' '}
          <span style={{ color: 'var(--pen)', position: 'relative', fontWeight: 600 }}>
            herói
          </span>.
        </div>
        <div style={{ position: 'absolute', right: 8, top: 6, color: 'var(--pen)' }}>
          <PenCircle width={80} height={36} stroke={2.5} rotate={-6} />
        </div>
      </div>

      {/* Botão */}
      <div style={{
        padding: '10px 16px', background: 'var(--brand)',
        color: 'var(--paper)', fontFamily: 'var(--font-display)',
        fontWeight: 700, fontSize: 12, letterSpacing: '0.08em',
        textTransform: 'uppercase', textAlign: 'center', marginBottom: 14,
      }}>
        Ver e‑books
      </div>

      {/* Quando usar */}
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 10,
        letterSpacing: '0.12em', textTransform: 'uppercase',
        color: 'var(--ink-soft)', marginBottom: 6,
      }}>
        Quando funciona
      </div>
      <div style={{ fontSize: 12, lineHeight: 1.5, color: 'var(--ink-2)' }}>
        {theme === 'A' && 'Se o público é conservador (rede escolar, secretaria). Evolução segura da identidade atual.'}
        {theme === 'B' && 'Padrão da marca. Caloroso, contemporâneo, editorial. Serve de YouTube a e-book sem forçar.'}
        {theme === 'C' && 'Peças de manifesto, palestra de abertura, capa de e‑book polêmico. Contraste alto vira atenção.'}
      </div>
    </ThemeScope>
  );
};

const DirectionsCompare = () => (
  <ThemeScope theme="A" style={{
    width: 1400, background: 'var(--paper)',
    padding: '64px 96px',
  }}>
    <SectionTitle
      kicker="Três direções · comparar"
      title="Três hipóteses da mesma voz."
    />
    <div style={{
      fontSize: 16, color: 'var(--ink-2)', maxWidth: 720, marginTop: 18,
      fontFamily: 'var(--font-quote)', fontStyle: 'italic',
    }}>
      Todas respeitam os princípios e os pilares. Mudam o volume e a temperatura — você escolheu a Direção A, a mais próxima da identidade já em uso.
    </div>

    <div style={{ display: 'flex', gap: 20, marginTop: 40 }}>
      <DirectionColumn theme="A" letter="A" recommended />
      <DirectionColumn theme="A" letter="B" />
      <DirectionColumn theme="C" letter="C" />
    </div>
  </ThemeScope>
);

/* ============ PALETA EXPANDIDA (direção B) ============ */
const PaletteDeep = () => (
  <ThemeScope theme="A" style={{
    width: 1400, background: 'var(--paper)', color: 'var(--ink)',
    padding: '64px 96px', fontFamily: 'var(--font-sans)',
  }}>
    <SectionTitle kicker="Direção escolhida · paleta" title="Uma cor dominante, duas vozes de apoio." />
    <div style={{ fontSize: 15.5, color: 'var(--ink-2)', maxWidth: 820, marginTop: 18, lineHeight: 1.55 }}>
      A paleta vem da convivência entre uma <em>sala de aula honesta</em> (verde‑oliva escuro, como lousa e livro didático) e um <em>tom humano quente</em> (terracota — aterra o discurso em algo físico e caloroso, na mesma família visual que faz o Claude da Anthropic convidativo). O amarelo é exclusivo para grifo de marca-texto.
    </div>

    <div style={{ marginTop: 48 }}>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 11,
        letterSpacing: '0.14em', textTransform: 'uppercase',
        color: 'var(--ink-soft)', marginBottom: 12,
      }}>Base · papel e tinta</div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 40 }}>
        <SwatchBig name="Paper" token="--a-paper" value="#F4EFE6" note="Fundo padrão. Off-white quente, baixa saturação." />
        <SwatchBig name="Paper 2" token="--a-paper-2" value="#EBE4D6" note="Cards, faixas, destaques suaves." dark={false} />
        <SwatchBig name="Ink" token="--a-ink" value="#1F2220" note="Texto principal. Quase-preto morno, não #000." dark />
        <SwatchBig name="Ink Soft" token="--a-ink-soft" value="#6B6F6A" note="Legendas, metadados, mono tags." />
      </div>

      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 11,
        letterSpacing: '0.14em', textTransform: 'uppercase',
        color: 'var(--ink-soft)', marginBottom: 12,
      }}>Marca · acentos</div>
      <div style={{ display: 'flex', gap: 16 }}>
        <SwatchBig name="Brand" token="--a-brand" value="#5A6B3A" note="Terra-Claude. CTAs, títulos, grifos editoriais." dark />
        <SwatchBig name="Brand Dark" token="--a-brand-dark" value="#3D4A28" note="Hover, sublinhados densos." dark />
        <SwatchBig name="Accent" token="--a-accent" value="#C9693F" note="Verde-profundo raro. Capas escuras, manifesto." dark />
        <SwatchBig name="Highlight" token="--a-highlight" value="#E8B644" note="Marca-texto. Apenas em trechos curtos." />
        <SwatchBig name="Pen" token="--a-pen" value="#B83A2E" note="Círculos, setas, canetadas manuais." dark />
      </div>
    </div>
  </ThemeScope>
);

const SwatchBig = ({ name, token, value, note, dark = false }) => (
  <div style={{ flex: 1 }}>
    <div style={{
      aspectRatio: '1.4', background: value, border: '1px solid rgba(0,0,0,0.08)',
      display: 'flex', alignItems: 'flex-end', padding: 14,
      color: dark ? '#F4EFE6' : '#1F2220',
    }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em' }}>
        {name}
      </div>
    </div>
    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--ink-soft)', marginTop: 8 }}>
      {token} · {value}
    </div>
    <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 4, lineHeight: 1.4 }}>
      {note}
    </div>
  </div>
);

/* ============ TIPOGRAFIA (direção B) ============ */
const TypographySection = () => (
  <ThemeScope theme="A" style={{
    width: 1400, background: 'var(--paper)', color: 'var(--ink)',
    padding: '64px 96px', fontFamily: 'var(--font-sans)',
  }}>
    <SectionTitle kicker="Tipografia" title="Quatro famílias, papéis distintos." />
    <div style={{ fontSize: 15.5, color: 'var(--ink-2)', maxWidth: 820, marginTop: 18, lineHeight: 1.55 }}>
      Defesa: <strong>Fraunces</strong> (serifa variável, humanista) carrega alma sem virar antiquário; é séria nos pesos baixos e tem personalidade nos altos. <strong>Inter</strong> é a sans mais confiável para corrido, legendas e UI. <strong>Instrument Serif Italic</strong> entra em citações e epígrafes — tom ensaístico. <strong>JetBrains Mono</strong> ancora metadados (datas, números, tags) com precisão. <strong>Caveat</strong> é exceção: só para bilhetinhos manuscritos pontuais.
    </div>

    <div style={{ display: 'grid', gap: 36, marginTop: 44 }}>
      <TypeSpecimen
        fontFamily="var(--font-display)" label="Fraunces · display" role="Títulos, capas, logos"
        sample="A escola real, com humor e método."
        size={68} weight={700}
      />
      <TypeSpecimen
        fontFamily="var(--font-display)" label="Fraunces · italic" role="Ênfases dentro de títulos"
        sample="Dar aula sem virar super-herói."
        size={56} weight={500} italic color="var(--brand)"
      />
      <TypeSpecimen
        fontFamily="var(--font-quote)" label="Instrument Serif · italic" role="Citações e epígrafes"
        sample="Devemos trabalhar com os professores normais."
        size={34} italic color="var(--ink-2)"
      />
      <TypeSpecimen
        fontFamily="var(--font-sans)" label="Inter · sans" role="Corrido, UI, legendas"
        sample="Este parágrafo se lê com conforto. Inter sustenta corridos longos sem competir com o título acima — que é o que queremos."
        size={18} weight={400}
      />
      <TypeSpecimen
        fontFamily="var(--font-mono)" label="JetBrains Mono · tag" role="Datas, números, metadados"
        sample="CARROSSEL · 2026-04-22 · N° 08"
        size={14} weight={500} color="var(--ink-soft)"
      />
      <TypeSpecimen
        fontFamily="var(--font-hand)" label="Caveat · manuscrita" role="Notas pontuais (raro)"
        sample="spoiler: não."
        size={34} weight={600} color="var(--pen)"
      />
    </div>
  </ThemeScope>
);

/* ============ DISPOSITIVOS GRÁFICOS ============ */
const DevicesSection = () => (
  <ThemeScope theme="A" style={{
    width: 1400, background: 'var(--paper)', color: 'var(--ink)',
    padding: '64px 96px', fontFamily: 'var(--font-sans)',
  }}>
    <SectionTitle kicker="Dispositivos gráficos" title="As marcas manuais da casa." />
    <div style={{ fontSize: 15.5, color: 'var(--ink-2)', maxWidth: 760, marginTop: 18, lineHeight: 1.5 }}>
      Um único gesto por peça. O professor corrige a prova com uma canetada, não com uma borrifada.
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginTop: 44 }}>
      {[
        { title: 'Círculo', sub: 'destaque de termo-chave', render: <div style={{ color: 'var(--pen)' }}><PenCircle width={180} height={100} stroke={4} rotate={-3} /></div> },
        { title: 'Sublinhado', sub: 'ênfase em títulos', render: <div style={{ color: 'var(--pen)' }}><PenUnderline width={180} height={20} stroke={4} /></div> },
        { title: 'Seta', sub: 'CTA, próximo passo', render: <div style={{ color: 'var(--pen)' }}><PenArrow width={120} height={80} stroke={3} rotate={10} /></div> },
        { title: 'Check', sub: 'listas de método', render: <div style={{ color: 'var(--brand)' }}><PenCheck size={70} stroke={5} /></div> },
        { title: 'Grifo', sub: 'palavras-chave em corrido', render: <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600 }}><span className="marker-highlight" style={{ '--marker-color': 'var(--highlight)' }}>trabalho real</span></div> },
        { title: 'Riscado', sub: 'negar um conceito', render: <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600 }}><span style={{ textDecoration: 'line-through', textDecorationColor: 'var(--pen)', textDecorationThickness: 3, color: 'var(--ink-soft)' }}>herói</span></div> },
        { title: 'Moldura avatar', sub: 'retratos do Rafael', render: <RafaelAvatar size={90} penColor="var(--brand)" /> },
        { title: 'Bilhete manuscrito', sub: 'piada, comentário', render: <div style={{ fontFamily: 'var(--font-hand)', fontSize: 32, color: 'var(--pen)', transform: 'rotate(-4deg)' }}>spoiler: não.</div> },
      ].map(d => (
        <div key={d.title} style={{
          background: 'var(--paper-2)', padding: '28px 20px 18px', position: 'relative',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'space-between', minHeight: 180,
        }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            {d.render}
          </div>
          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600 }}>
              {d.title}
            </div>
            <div style={{ fontSize: 11, color: 'var(--ink-soft)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', marginTop: 2 }}>
              {d.sub}
            </div>
          </div>
        </div>
      ))}
    </div>
  </ThemeScope>
);

/* ============ LOGO + MONOGRAMA ============ */
const LogoSection = () => (
  <ThemeScope theme="A" style={{
    width: 1400, background: 'var(--paper)', color: 'var(--ink)',
    padding: '64px 96px', fontFamily: 'var(--font-sans)',
  }}>
    <SectionTitle kicker="Marca gráfica" title="Três variações, um só sistema." />

    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: 32, marginTop: 48 }}>
      <div style={{ background: 'var(--paper-2)', padding: '48px 32px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 260 }}>
        <RafaelLogo variant="stacked" color="var(--ink)" penColor="var(--brand)" size={1} />
      </div>
      <div style={{ background: 'var(--paper-2)', padding: '48px 32px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 260 }}>
        <RafaelLogo variant="inline" color="var(--ink)" penColor="var(--brand)" size={1} />
      </div>
      <div style={{ background: 'var(--paper-2)', padding: '48px 32px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 260 }}>
        <RafaelMonogram size={140} bg="var(--paper)" color="var(--ink)" penColor="var(--brand)" />
      </div>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: 32, marginTop: 16 }}>
      {[
        ['Stacked', 'Principal em capas de e-book, slides de abertura, sobre.'],
        ['Inline', 'Site, cabeçalhos, assinatura LinkedIn. Versão mais usada.'],
        ['Monograma PR', 'Avatar, favicon, selo. Nunca substitui a marca em peças principais.'],
      ].map(([t, d]) => (
        <div key={t}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600 }}>{t}</div>
          <div style={{ fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.5, marginTop: 4 }}>{d}</div>
        </div>
      ))}
    </div>

    {/* versão em fundo escuro */}
    <div style={{ marginTop: 48, background: 'var(--accent)', padding: '56px 32px', display: 'flex', gap: 48, alignItems: 'center', justifyContent: 'center' }}>
      <RafaelLogo variant="inline" color="var(--paper)" penColor="var(--brand)" size={1.1} />
      <RafaelMonogram size={96} bg="transparent" color="var(--paper)" penColor="var(--brand)" />
    </div>
    <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 8, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>
      Em fundo escuro: tinta vira papel, acento mantém cor.
    </div>
  </ThemeScope>
);

/* ============ VOICE / DO&DON'T ============ */
const VoiceSection = () => (
  <ThemeScope theme="A" style={{
    width: 1400, background: 'var(--paper)', color: 'var(--ink)',
    padding: '64px 96px', fontFamily: 'var(--font-sans)',
  }}>
    <SectionTitle kicker="Voz da marca" title="Como a marca fala — e como não fala." />

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, marginTop: 48 }}>
      <div style={{ background: 'var(--paper-2)', padding: 32, borderTop: '3px solid var(--brand)' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--brand)', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 16 }}>
          Fala assim ✓
        </div>
        {[
          'Professor não precisa ser herói. Precisa de repertório.',
          'A Escola da Ponte é linda. O problema é que ela está fora da norma.',
          'Se a aula só funciona quando você está em dia bom, o problema não é seu humor — é o desenho da aula.',
          'A escola real é a que cabe no seu sábado de correção de prova.',
        ].map((s, i) => (
          <div key={i} style={{ fontFamily: 'var(--font-quote)', fontStyle: 'italic', fontSize: 18, lineHeight: 1.4, color: 'var(--ink)', marginBottom: 14, paddingBottom: 14, borderBottom: i < 3 ? '1px solid rgba(0,0,0,0.08)' : 'none' }}>
            “{s}”
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--paper-2)', padding: 32, borderTop: '3px solid var(--pen)' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--pen)', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 16 }}>
          Nunca fala assim ✗
        </div>
        {[
          'Transforme sua aula em uma experiência mágica! ✨',
          'O professor é o verdadeiro herói da sociedade.',
          'Abrace o seu propósito docente e deixe o universo conspirar.',
          'Dicas rápidas infalíveis para virar o professor dos sonhos!',
        ].map((s, i) => (
          <div key={i} style={{ fontSize: 16, lineHeight: 1.4, color: 'var(--ink-soft)', textDecoration: 'line-through', textDecorationColor: 'var(--pen)', textDecorationThickness: 2, marginBottom: 14, paddingBottom: 14, borderBottom: i < 3 ? '1px solid rgba(0,0,0,0.08)' : 'none' }}>
            {s}
          </div>
        ))}
      </div>
    </div>
  </ThemeScope>
);

Object.assign(window, {
  GuideIntro, Principles, SectionTitle,
  DirectionsCompare, DirectionColumn,
  PaletteDeep, SwatchBig,
  TypographySection, DevicesSection,
  LogoSection, VoiceSection,
});
