import path from 'node:path';
import sharp from 'sharp';

const referenceDirectory = path.resolve('Referencias visuais');
const charactersDirectory = path.resolve('public/characters');
const images = {
  'Gemini_Generated_Image_.png': 'filha-regando.webp',
  'Gemini_Generated_Image_ (4).png': 'mae-filha-abraco.webp',
  'Gemini_Generated_Image_ (1).png': 'pai-filha-celebrando.webp',
  'Gemini_Generated_Image_ (3).png': 'pai-filha-livros.webp',
  'Gemini_Generated_Image_fbt8twfbt8twfbt8.png': 'pai-rede.webp',
};

await Promise.all(Object.entries(images).map(async ([sourceName, destinationName]) => {
  const source = path.join(referenceDirectory, sourceName);
  const destination = path.join(charactersDirectory, destinationName);

  await sharp(source)
    .rotate()
    .resize({ width: 800, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(destination);

  console.log(`${sourceName} -> ${destinationName}`);
}));
