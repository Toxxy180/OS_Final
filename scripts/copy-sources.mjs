import { cp, mkdir } from 'node:fs/promises';
await mkdir('dist/OS_Files', { recursive: true });
await cp('OS_Files', 'dist/OS_Files', { recursive: true });
console.log('Copied 10 course PDFs to build output.');
