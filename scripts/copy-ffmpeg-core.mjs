import { cp, mkdir, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { resolve } from 'node:path';

const sourceDir = resolve('node_modules/@ffmpeg/core/dist/esm');
const targetDir = resolve('public/ffmpeg');

const files = ['ffmpeg-core.js', 'ffmpeg-core.wasm'];

await mkdir(targetDir, { recursive: true });

for (const file of files) {
  const source = resolve(sourceDir, file);
  const target = resolve(targetDir, file);

  await access(source, constants.R_OK);
  await cp(source, target);
  console.log(`Copied ${file} -> public/ffmpeg/${file}`);
}
