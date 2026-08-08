import path from 'node:path';
import sharp from 'sharp';

// Ícones do PWA: recorte quadrado da arte da Cecília regando o jardim.
// O recorte pega o rosto, o regador e a plantinha — os três elementos que
// identificam o jogo num ícone pequeno na tela inicial do tablet.
const source = path.resolve('Referencias visuais', 'Gemini_Generated_Image_.png');
const destinationDirectory = path.resolve('public', 'icons');
const BRAND_GREEN = '#58CC02';

const square = () => sharp(source).extract({ left: 40, top: 360, width: 800, height: 800 });

const write = async (image, name) => {
  const destination = path.join(destinationDirectory, name);
  await image.png({ palette: true, quality: 90, compressionLevel: 9 }).toFile(destination);
  console.log(`-> ${name}`);
};

// Ícones "any": a arte ocupa o quadrado inteiro.
for (const size of [192, 512]) {
  await write(square().resize(size, size), `icon-${size}.png`);
}

// Ícone "maskable": o Android recorta as bordas em círculo/squircle, então a
// arte fica em 80% do quadrado sobre o verde da marca (zona segura).
for (const size of [192, 512]) {
  const inner = Math.round(size * 0.8);
  const art = await square().resize(inner, inner).png().toBuffer();
  await write(
    sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: BRAND_GREEN,
      },
    }).composite([{ input: art, gravity: 'center' }]),
    `maskable-${size}.png`,
  );
}

// Ícone da aba/atalho em resolução pequena.
await write(square().resize(64, 64), 'favicon-64.png');
