import { copyFile, mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const output = path.join(root, '.worker-assets');
const files = [
  [['index.html'], ['index.html']],
  [['index.css'], ['index.css']],
  [['index.js'], ['index.js']],
  [['site-config.js'], ['site-config.js']],
  [['supabase','connection.js'], ['supabase','connection.js']],
  [['Guía','admin','admin.html'], ['admin','admin.html']],
  [['Guía','admin','admin.css'], ['admin','admin.css']],
  [['Guía','admin','admin.js'], ['admin','admin.js']],
  [['assets','logo_yazu.svg'], ['assets','logo_yazu.svg']],
  [['assets','logo_yazu.png'], ['assets','logo_yazu.png']],
  [['assets','decorativas','inicio.jpg'], ['assets','decorativas','inicio.jpg']],
  [['assets','decorativas','foto-1.jpg'], ['assets','decorativas','foto-1.jpg']],
  [['assets','decorativas','foto-2.jpg'], ['assets','decorativas','foto-2.jpg']],
  [['assets','decorativas','foto-3.jpg'], ['assets','decorativas','foto-3.jpg']],
  [['assets','gallery','IMG_1780.JPG'], ['assets','gallery','IMG_1780.JPG']],
  [['assets','gallery','IMG_1781.JPG'], ['assets','gallery','IMG_1781.JPG']],
  [['assets','gallery','26.10.22 Taller V GIGUP  (24).jpeg'], ['assets','gallery','26.10.22 Taller V GIGUP  (24).jpeg']],
  [['assets','gallery','26.10.22 Taller V GIGUP  (27).jpeg'], ['assets','gallery','26.10.22 Taller V GIGUP  (27).jpeg']],
  [['assets','gallery','20230715_111245.jpeg'], ['assets','gallery','20230715_111245.jpeg']],
  [['assets','gallery','20260208_110027.jpeg'], ['assets','gallery','20260208_110027.jpeg']],
  [['assets','gallery','1N3A2065.JPG'], ['assets','gallery','1N3A2065.JPG']],
  [['assets','gallery','1N3A2113.JPG'], ['assets','gallery','1N3A2113.JPG']],
  [['assets','gallery','IMG_7096.jpeg'], ['assets','gallery','IMG_7096.jpeg']],
  [['assets','gallery','IMG_7259.jpeg'], ['assets','gallery','IMG_7259.jpeg']],
  [['assets','gallery','IMG_7674.jpeg'], ['assets','gallery','IMG_7674.jpeg']],
  [['assets','gallery','1N3A2078.JPG'], ['assets','gallery','1N3A2078.JPG']],
  [['assets','gallery','1N3A2165.JPG'], ['assets','gallery','1N3A2165.JPG']],
  [['assets','gallery','IMG_7262.jpeg'], ['assets','gallery','IMG_7262.jpeg']],
  [['assets','gallery','IMG_7692.jpeg'], ['assets','gallery','IMG_7692.jpeg']],
  [['assets','fondos','fondo-1.png'], ['assets','fondos','fondo-1.png']],
  [['assets','fondos','fondo-2.png'], ['assets','fondos','fondo-2.png']],
  [['assets','fondos','fondo-3.png'], ['assets','fondos','fondo-3.png']],
  [['assets','videos','chaperno.mp4'], ['assets','videos','chaperno.mp4']],
];
const allowed = new Set(files.map(([, destination]) => path.join(...destination)));
await mkdir(output, {recursive:true});
async function checkOutput(relative = '') {
  for (const entry of await readdir(path.join(output, relative), {withFileTypes:true})) {
    const name = path.join(relative, entry.name);
    if (entry.isDirectory()) await checkOutput(name);
    else if (!entry.isFile() || !allowed.has(name)) throw new Error(`Archivo inesperado en recursos públicos: ${name}`);
  }
}
await checkOutput();
for (const [source, destination] of files) {
  const target = path.join(output, ...destination);
  await mkdir(path.dirname(target), {recursive:true});
  await copyFile(path.join(root, ...source), target);
}
console.log('Archivos públicos preparados en .worker-assets.');
