import { readFile,writeFile } from 'node:fs/promises';
const api=process.env.VITE_API_BASE_URL||'';
// A native build works offline without a configured backend; never embeds credentials.
let html=await readFile('dist/index.html','utf8');
html=html.replace(/<link rel="manifest"[^>]*\/>/,'');await writeFile('dist/index.html',html);
console.log('Native offline assets prepared. Configure VITE_API_BASE_URL and VITE_PUBLIC_SITE_URL for public sharing.');
