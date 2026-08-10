import { useId, type CSSProperties } from 'react';
import { MAP_NODES } from './config';

/**
 * O jardim desenhado.
 *
 * Regador e planta são objetos, não pessoas — ninguém precisa que se pareçam
 * com alguém específico. Por isso são SVG escrito à mão no mesmo idioma visual
 * das artes da família (contorno preto grosso, cor chapada, sem gradiente) em
 * vez de imagem. Custa ~4 KB, não pixeliza em tela nenhuma, e o nível de água e
 * o tamanho da planta viram parâmetro em vez de arquivo novo.
 */

const INK = '#1f1f1f';
const CAN_BODY = 'M52,74 L148,74 L139,170 Q139,181 128,181 L72,181 Q61,181 61,170 Z';

const CAN_RATIO = 250 / 210;
const PLANT_RATIO = 200 / 215;

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

type Drawing = {
  height: number;
  className?: string;
  style?: CSSProperties;
};

/**
 * O nível da água nunca é animado por atributo de geometria — alguns
 * navegadores não interpolam `y`/`height` de SVG. Um `translateY` num grupo
 * funciona em todo lugar.
 */
const WATER_TOP = 84;
const WATER_BOTTOM = 180;

export function WateringCan({ fill, height, className, style }: Drawing & { fill: number }) {
  // useId traz caracteres que não valem dentro de url(#...).
  const clipId = `agua-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const sunk = (1 - clamp01(fill)) * (WATER_BOTTOM - WATER_TOP);

  return (
    <svg
      viewBox="0 0 250 210"
      height={height}
      width={height * CAN_RATIO}
      className={className}
      style={style}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <clipPath id={clipId}>
          <path d={CAN_BODY} />
        </clipPath>
      </defs>

      <path d="M150,104 L214,66 L228,88 L162,128 Z" fill="#b9cdda" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <ellipse cx={222} cy={76} rx={17} ry={12} transform="rotate(-31 222 76)" fill="#a3bccb" stroke={INK} strokeWidth={6} />
      <path d="M64,70 C64,22 136,22 136,70" fill="none" stroke={INK} strokeWidth={17} strokeLinecap="round" />
      <path d="M64,70 C64,22 136,22 136,70" fill="none" stroke="#b9cdda" strokeWidth={7} strokeLinecap="round" />

      <path d={CAN_BODY} fill="#dbe8f0" fillOpacity={0.85} />
      <g clipPath={`url(#${clipId})`}>
        <g style={{ transform: `translateY(${sunk}px)`, transition: 'transform 650ms cubic-bezier(.34,1.2,.64,1)' }}>
          <rect x={45} y={WATER_TOP} width={160} height={WATER_BOTTOM - WATER_TOP + 8} fill="#4fc3f7" />
          <ellipse cx={100} cy={WATER_TOP} rx={48} ry={7} fill="#81d4fa" />
        </g>
      </g>

      <path d={CAN_BODY} fill="none" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      <ellipse cx={100} cy={74} rx={48} ry={13} fill="#c6d9e4" stroke={INK} strokeWidth={7} />
      <ellipse cx={100} cy={74} rx={36} ry={7} fill="#8fb3c7" />
    </svg>
  );
}

const PLANT_BASE_Y = 150;
const LEAF_HEIGHTS = [0.95, 0.8, 0.62, 0.48, 0.33, 0.22];

/** A partir daqui aparecem botões; depois eles abrem. Casa com "A Festa" e "O Florescer". */
const BUDS_FROM = 40 / (MAP_NODES.length - 1);
const FLOWERS_FROM = 50 / (MAP_NODES.length - 1);

export function Plant({ growth, height, className, style }: Drawing & { growth: number }) {
  const progress = clamp01(growth);
  // Curva adiantada: as primeiras fases precisam render mudança visível, senão
  // a planta não motiva ninguém nos primeiros dias.
  const eased = Math.pow(progress, 0.7);
  const stem = 46 + eased * 84;
  const top = PLANT_BASE_Y - stem;
  const leafCount = Math.min(LEAF_HEIGHTS.length, 2 + Math.floor(eased * 5.2));
  const flowerSpots: Array<[number, number]> = [[100, top - 8], [70, top + 20], [130, top + 20]];

  return (
    <svg
      viewBox="0 0 200 215"
      height={height}
      width={height * PLANT_RATIO}
      className={className}
      style={style}
      aria-hidden="true"
      focusable="false"
    >
      <path d={`M100,${PLANT_BASE_Y} L100,${top}`} stroke={INK} strokeWidth={15} strokeLinecap="round" fill="none" />
      <path d={`M100,${PLANT_BASE_Y} L100,${top}`} stroke="#6fbf3a" strokeWidth={7} strokeLinecap="round" fill="none" />

      {LEAF_HEIGHTS.slice(0, leafCount).map((leafHeight, index) => {
        const side = index % 2 === 0 ? -1 : 1;
        const scale = (0.46 + (1 - leafHeight) * 0.34) * (0.78 + eased * 0.34);
        return (
          <path
            key={leafHeight}
            d={`M0,0 C${22 * side},-20 ${52 * side},-14 ${58 * side},4 C${46 * side},20 ${16 * side},18 0,0 Z`}
            transform={`translate(100 ${PLANT_BASE_Y - stem * leafHeight}) scale(${scale})`}
            fill="#5cb82e"
            stroke={INK}
            strokeWidth={7}
          />
        );
      })}

      {progress >= BUDS_FROM && flowerSpots.map(([x, y]) => (
        <g key={`${x}-${y}`} transform={`translate(${x} ${y})`}>
          {progress >= FLOWERS_FROM ? (
            <>
              {[0, 72, 144, 216, 288].map(angle => (
                <ellipse key={angle} cx={0} cy={-14} rx={8} ry={12} transform={`rotate(${angle})`} fill="#ff86d0" stroke={INK} strokeWidth={5} />
              ))}
              <circle r={7} fill="#ffc800" stroke={INK} strokeWidth={5} />
            </>
          ) : (
            <ellipse rx={9} ry={13} fill="#ff9ed8" stroke={INK} strokeWidth={6} />
          )}
        </g>
      ))}

      <path d="M62,146 L138,146 L128,198 Q128,204 122,204 L78,204 Q72,204 72,198 Z" fill="#d4703a" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      <rect x={56} y={134} width={88} height={22} rx={7} fill="#e08850" stroke={INK} strokeWidth={7} />
    </svg>
  );
}

const DROPS = [
  { cx: 10, cy: 8, r: 6, delay: 0 },
  { cx: 26, cy: 2, r: 5, delay: 0.18 },
  { cx: 4, cy: 18, r: 5, delay: 0.36 },
  { cx: 20, cy: 14, r: 6, delay: 0.54 },
];

/**
 * A cena de regar. O regador e a planta ficam em `div`s próprias porque girar
 * um elemento HTML é confiável em qualquer navegador — `transform-box` em SVG
 * não é. As gotas são posicionadas no bico com deslocamento fixo, o que só
 * funciona porque as duas alturas aqui são fixas.
 */
export function PourScene({ growth, pouring, popping }: { growth: number; pouring: boolean; popping: boolean }) {
  return (
    <div className="relative flex items-end justify-center" style={{ height: 168 }}>
      {/* O regador fica acima da linha do vaso: senão o bico nasce na altura da
          terra e a água não tem de onde cair. */}
      <div
        style={{
          marginBottom: 30,
          transformOrigin: '86% 58%',
          transform: pouring ? 'rotate(34deg) translate(-4px,-10px)' : 'none',
          transition: 'transform 550ms cubic-bezier(.34,1.4,.64,1)',
        }}
      >
        <WateringCan fill={1} height={124} />
      </div>

      <svg
        viewBox="0 0 60 130"
        width={54}
        height={117}
        aria-hidden="true"
        focusable="false"
        className="absolute pointer-events-none"
        style={{ left: '44%', top: 58, opacity: pouring ? 1 : 0, transition: 'opacity 200ms' }}
      >
        {DROPS.map(drop => (
          <ellipse
            key={`${drop.cx}-${drop.cy}`}
            cx={drop.cx}
            cy={drop.cy}
            rx={drop.r}
            ry={drop.r * 1.5}
            fill="#4fc3f7"
            stroke={INK}
            strokeWidth={4}
            style={pouring ? { animation: `waterFall .75s linear ${drop.delay}s infinite` } : { opacity: 0 }}
          />
        ))}
      </svg>

      <div
        style={{
          transformOrigin: 'bottom center',
          transform: popping ? 'scale(1.12)' : 'none',
          transition: 'transform 420ms cubic-bezier(.34,1.5,.64,1)',
        }}
      >
        <Plant growth={growth} height={152} />
      </div>
    </div>
  );
}
