import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.dirname(fileURLToPath(import.meta.url));
const output = path.join(root, 'dist');
await fs.mkdir(output, { recursive: true });
await fs.copyFile(path.join(root, 'index.html'), path.join(output, 'index.html'));
await fs.cp(path.join(root, 'assets'), path.join(output, 'assets'), { recursive: true });
console.log('Built static homepage in dist/');
